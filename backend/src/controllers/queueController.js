import dayjs from "dayjs";
import QueueTicket from "../models/QueueTicket.js";
import { createNotification } from "./notificationController.js";
const ACTIVE_STATUSES = ["waiting", "called", "serving"];

const sanitiseServiceName = (service = "") => service.trim();

const generateTicketNumber = (service) => {
  const prefix =
    service
      .split(/\s+/)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("")
      .slice(0, 4) || "Q";
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
};

export const createQueueTicket = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ success: false, message: "Only students can join queue" });
    }

    const service = sanitiseServiceName(req.body.service);
    if (!service) {
      return res
        .status(400)
        .json({ success: false, message: "Service is required" });
    }

    const department =
      req.body.department?.trim() || req.user.department || null;
    const description = req.body.description?.trim();

    const highest = await QueueTicket.findOne({
      service,
      status: { $in: ACTIVE_STATUSES },
    })
      .sort({ position: -1 })
      .select("position");

    const position = highest?.position ? highest.position + 1 : 1;

    const ticket = await QueueTicket.create({
      service,
      department,
      description,
      user: req.user._id,
      position,
      ticketNumber: generateTicketNumber(service),
    });

    return res
      .status(201)
      .json({ success: true, message: "Queue ticket created", ticket });
  } catch (error) {
    console.error("createQueueTicket error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create queue ticket" });
  }
};

export const listMyTickets = async (req, res) => {
  try {
    const tickets = await QueueTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("listMyTickets error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load queue tickets" });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const ticket = await QueueTicket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (!ACTIVE_STATUSES.includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending tickets can be cancelled",
      });
    }

    ticket.status = "cancelled";
    ticket.cancelledReason = req.body.reason?.trim() || "Cancelled by user";
    ticket.position = 0;
    await ticket.save();

    return res.json({ success: true, message: "Ticket cancelled" });
  } catch (error) {
    console.error("cancelTicket error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel ticket" });
  }
};

export const adminListServices = async (_req, res) => {
  try {
    const services = await QueueTicket.distinct("service");
    services.sort();
    return res.json({ success: true, services });
  } catch (error) {
    console.error("adminListServices error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load services" });
  }
};

export const adminListQueue = async (req, res) => {
  try {
    const service = sanitiseServiceName(req.params.service);
    if (!service) {
      return res
        .status(400)
        .json({ success: false, message: "Service is required" });
    }

    const { status } = req.query;
    const filter = { service };
    if (status) filter.status = status;

    const tickets = await QueueTicket.find(filter)
      .populate("user", "name email department")
      .populate("handledBy", "name email role")
      .sort({ position: 1, createdAt: 1 });

    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("adminListQueue error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load queue" });
  }
};

const allowedStatuses = [
  "waiting",
  "called",
  "serving",
  "completed",
  "cancelled",
];

export const adminUpdateTicketStatus = async (req, res) => {
  try {
    const { status, handledBy, estimateMinutes } = req.body;
    if (!status || !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const ticket = await QueueTicket.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    ticket.status = status;

    if (handledBy) ticket.handledBy = handledBy;
    else if (["called", "serving"].includes(status)) {
      ticket.handledBy = req.user._id;
    }

    if (estimateMinutes) {
      const eta = dayjs().add(Number(estimateMinutes), "minute");
      if (eta.isValid()) ticket.estimatedTime = eta.toDate();
    }

    // ✅ Set timestamps or reasons
    if (status === "completed") {
      ticket.completedAt = new Date();
    }

    if (status === "cancelled") {
      ticket.cancelledReason = req.body.reason?.trim() || "Cancelled";
    }

    if (!ACTIVE_STATUSES.includes(status)) {
      ticket.position = 0;
    }

    await ticket.save();

    // 🔔 Send Notifications
    try {
      switch (status) {
        case "called":
          await createNotification(
            ticket.user._id,
            `📢 Your queue ticket for "${ticket.service}" is being called. Please proceed to the counter.`,
            "queue"
          );
          break;
        case "serving":
          await createNotification(
            ticket.user._id,
            `🕐 Your queue ticket for "${ticket.service}" is now being served.`,
            "queue"
          );
          break;
        case "completed":
          await createNotification(
            ticket.user._id,
            `✅ Your queue ticket for "${ticket.service}" has been completed.`,
            "queue"
          );
          break;
        case "cancelled":
          await createNotification(
            ticket.user._id,
            `❌ Your queue ticket for "${ticket.service}" was cancelled.`,
            "queue"
          );
          break;
      }
    } catch (notifyErr) {
      console.warn("Notification creation failed:", notifyErr.message);
    }

    return res.json({ success: true, message: "Ticket updated", ticket });
  } catch (error) {
    console.error("adminUpdateTicketStatus error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update ticket" });
  }
};
