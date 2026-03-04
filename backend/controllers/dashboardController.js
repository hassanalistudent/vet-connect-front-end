import DoctorAppointment from "../models/doctorAppointment.js";
import DoctorProfile from "../models/doctorProfile.js";
import Pet from "../models/pet.js";
import User from "../models/user.js";
import moment from "moment";

// @desc    Get doctor dashboard analytics
// @route   GET /api/dashboard/doctor
// @access  Private/Doctor
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get doctor profile with reviews
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });

    // Get all appointments for this doctor
    const appointments = await DoctorAppointment.find({ doctorId })
      .populate("petId", "petName petType breed")
      .populate("ownerId", "fullName email phone")
      .sort({ createdAt: -1 });

    // 1. APPOINTMENTS OVERVIEW
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === "Completed").length;
    const cancelledAppointments = appointments.filter(a => a.status === "Cancelled").length;
    const upcomingAppointments = appointments.filter(a =>
      ["Scheduled", "Accepted", "Rescheduled"].includes(a.status) &&
      moment(a.appointmentDate).isSameOrAfter(moment(), 'day')
    ).length;
    const pendingAction = appointments.filter(a => a.status === "Scheduled").length;

    // Daily/Weekly/Monthly trends
    const today = moment().startOf('day');
    const weekStart = moment().startOf('week');
    const monthStart = moment().startOf('month');

    const todayAppointments = appointments.filter(a =>
      moment(a.appointmentDate).isSame(today, 'day')
    ).length;

    const thisWeekAppointments = appointments.filter(a =>
      moment(a.appointmentDate).isSameOrAfter(weekStart)
    ).length;

    const thisMonthAppointments = appointments.filter(a =>
      moment(a.appointmentDate).isSameOrAfter(monthStart)
    ).length;

    // Appointment trends (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const count = appointments.filter(a =>
        moment(a.appointmentDate).format('YYYY-MM-DD') === date
      ).length;
      last7Days.push({ date: moment(date).format('ddd'), count });
    }

    // 2. RATINGS & REVIEWS
    const rating = doctorProfile?.rating || 0;
    const totalReviews = doctorProfile?.numReviews || 0;

    // Rating distribution
    const reviews = doctorProfile?.reviews || [];
    const ratingDistribution = {
      fiveStar: reviews.filter(r => r.rating === 5).length,
      fourStar: reviews.filter(r => r.rating === 4).length,
      threeStar: reviews.filter(r => r.rating === 3).length,
      twoStar: reviews.filter(r => r.rating === 2).length,
      oneStar: reviews.filter(r => r.rating === 1).length,
    };

    // Recent reviews (last 5)
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        id: r._id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        timeAgo: moment(r.createdAt).fromNow()
      }));

    // 3. PATIENT ENGAGEMENT
    const uniquePatients = [...new Set(appointments.map(a => a.ownerId?._id?.toString()))].length;

    // New vs Repeat patients
    const patientCounts = {};
    appointments.forEach(a => {
      const ownerId = a.ownerId?._id?.toString();
      if (ownerId) {
        patientCounts[ownerId] = (patientCounts[ownerId] || 0) + 1;
      }
    });

    const repeatPatients = Object.values(patientCounts).filter(c => c > 1).length;
    const newPatients = uniquePatients - repeatPatients;

    // Top patients (most appointments)
    const topPatients = Object.entries(patientCounts)
      .map(([id, count]) => {
        const appointment = appointments.find(a => a.ownerId?._id?.toString() === id);
        return {
          id,
          name: appointment?.ownerId?.fullName || "Unknown",
          phone: appointment?.ownerId?.phone,
          appointmentCount: count
        };
      })
      .sort((a, b) => b.appointmentCount - a.appointmentCount)
      .slice(0, 5);

    // 4. APPOINTMENT TYPES
    const appointmentTypes = {
      homeVisit: appointments.filter(a => a.appointmentType === "Home Visit").length,
      videoCall: appointments.filter(a => a.appointmentType === "Video Call").length,
      onClinic: appointments.filter(a => a.appointmentType === "On Clinic").length,
    };

    // 5. STATUS BREAKDOWN
    const statusBreakdown = {
      scheduled: appointments.filter(a => a.status === "Scheduled").length,
      accepted: appointments.filter(a => a.status === "Accepted").length,
      rescheduled: appointments.filter(a => a.status === "Rescheduled").length,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
    };

    // 6. NOTIFICATIONS & ALERTS
    const alerts = [];

    // Verification status alert
    const verificationStatus = doctorProfile?.verificationUploads?.status || "Pending";
    if (verificationStatus === "Pending") {
      alerts.push({
        id: "verification-pending",
        type: "warning",
        title: "Verification Pending",
        message: "Your license is under review. Please allow 24-48 hours for verification.",
        action: "/doctor/profile"
      });
    } else if (verificationStatus === "Rejected") {
      alerts.push({
        id: "verification-rejected",
        type: "error",
        title: "Verification Rejected",
        message: "Your license was rejected. Please upload a clearer image.",
        action: "/doctor/profile"
      });
    }

    // Upcoming appointments reminder
    const tomorrow = moment().add(1, 'day').startOf('day');
    const tomorrowAppointments = appointments.filter(a =>
      moment(a.appointmentDate).isSame(tomorrow, 'day') &&
      ["Scheduled", "Accepted", "Rescheduled"].includes(a.status)
    ).length;

    if (tomorrowAppointments > 0) {
      alerts.push({
        id: "tomorrow-reminder",
        type: "info",
        title: "Tomorrow's Schedule",
        message: `You have ${tomorrowAppointments} appointment${tomorrowAppointments > 1 ? 's' : ''} tomorrow.`,
        action: "/doctor/appointments"
      });
    }

    // Pending responses
    if (pendingAction > 0) {
      alerts.push({
        id: "pending-responses",
        type: "info",
        title: "Pending Actions",
        message: `You have ${pendingAction} appointment${pendingAction > 1 ? 's' : ''} waiting for your response.`,
        action: "/doctor/appointments"
      });
    }
    // 7. RECENT ACTIVITY - FIXED to show most recent updates
    const recentActivity = appointments
      .sort((a, b) => {
        // Sort by most recent activity (updatedAt, then createdAt, then appointmentDate)
        const dateA = a.updatedAt || a.createdAt || a.appointmentDate;
        const dateB = b.updatedAt || b.createdAt || b.appointmentDate;
        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 5)
      .map(a => ({
        id: a._id,
        petName: a.petId?.petName || "Unknown Pet",
        ownerName: a.ownerId?.fullName || "Unknown Owner",
        date: a.appointmentDate,
        timeAgo: moment(a.updatedAt || a.createdAt).fromNow(), // Show when it was last updated
        status: a.status,
        type: a.appointmentType,
        isUpdated: a.updatedAt ? true : false // Optional: flag to show if it was recently updated
      }));

    res.json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          upcomingAppointments,
          pendingAction,
          todayAppointments,
          thisWeekAppointments,
          thisMonthAppointments
        },
        trends: {
          last7Days
        },
        ratings: {
          average: rating.toFixed(1),
          total: totalReviews,
          distribution: ratingDistribution,
          recent: recentReviews
        },
        patients: {
          unique: uniquePatients,
          new: newPatients,
          repeat: repeatPatients,
          topPatients
        },
        appointments: {
          types: appointmentTypes,
          statusBreakdown
        },
        alerts,
        recentActivity
      }
    });

  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get admin dashboard analytics
// @route   GET /api/dashboard/admin?period=week
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const { period } = req.query;
    const activePeriod = period || "week";

    // ========== STATIC DATA ==========

    // 1. PLATFORM USAGE
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "Doctor" });
    const totalPetOwners = await User.countDocuments({ role: "PetOwner" });
    const totalAdmins = await User.countDocuments({ role: "Admin" });

    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;

    const approvedDoctors = await DoctorProfile.countDocuments({
      "verificationUploads.status": "Approved"
    });
    const pendingDoctors = await DoctorProfile.countDocuments({
      "verificationUploads.status": "Pending"
    });
    const rejectedDoctors = await DoctorProfile.countDocuments({
      "verificationUploads.status": "Rejected"
    });

    // 2. APPOINTMENT STATISTICS
    const totalAppointments = await DoctorAppointment.countDocuments();

    const appointmentsByStatus = {
      scheduled: await DoctorAppointment.countDocuments({ status: "Scheduled" }),
      accepted: await DoctorAppointment.countDocuments({ status: "Accepted" }),
      rescheduled: await DoctorAppointment.countDocuments({ status: "Rescheduled" }),
      completed: await DoctorAppointment.countDocuments({ status: "Completed" }),
      cancelled: await DoctorAppointment.countDocuments({ status: "Cancelled" })
    };

    const appointmentsByType = {
      homeVisit: await DoctorAppointment.countDocuments({ appointmentType: "Home Visit" }),
      videoCall: await DoctorAppointment.countDocuments({ appointmentType: "Video Call" }),
      onClinic: await DoctorAppointment.countDocuments({ appointmentType: "On Clinic" })
    };

    const paidAppointments = await DoctorAppointment.countDocuments({ isPaid: true });
    const unpaidAppointments = totalAppointments - paidAppointments;

    const today = moment().startOf('day');
    const todayAppointments = await DoctorAppointment.countDocuments({
      appointmentDate: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    // 3. RATINGS & DOCTOR PERFORMANCE
    const doctorsWithProfiles = await DoctorProfile.find()
      .populate("userId", "fullName email")
      .lean();

    const doctorsWithReviews = doctorsWithProfiles.filter(d => d.numReviews > 0);
    const totalRating = doctorsWithProfiles.reduce((acc, d) => acc + (d.rating || 0), 0);
    const avgPlatformRating = doctorsWithProfiles.length > 0
      ? (totalRating / doctorsWithProfiles.length).toFixed(1)
      : "0.0";

    const lowRatedDoctors = doctorsWithProfiles
      .filter(d => d.rating < 3 && d.numReviews > 0)
      .length;

    // 4. PET STATISTICS
    const totalPets = await Pet.countDocuments().catch(() => 0);
    const petsByType = {
      cats: await Pet.countDocuments({ petType: "Cat" }).catch(() => 0),
      dogs: await Pet.countDocuments({ petType: "Dog" }).catch(() => 0),
      birds: await Pet.countDocuments({ petType: "Bird" }).catch(() => 0)
    };

    // ========== DYNAMIC TRENDS DATA ==========

    const days = activePeriod === "month" ? 30 : 7;
    const dateFormat = activePeriod === "month" ? "MMM D" : "ddd";

    const startDate = moment().subtract(days, 'days').startOf('day').toDate();

    const [allAppointments, allUsers] = await Promise.all([
      DoctorAppointment.find({
        appointmentDate: { $gte: startDate }
      }).lean(),
      User.find({
        createdAt: { $gte: startDate }
      }).lean()
    ]);

    // User registration trends
    const userTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');

      const doctors = allUsers.filter(u =>
        u.role === "Doctor" &&
        moment(u.createdAt).format('YYYY-MM-DD') === dateStr
      ).length;

      const owners = allUsers.filter(u =>
        u.role === "PetOwner" &&
        moment(u.createdAt).format('YYYY-MM-DD') === dateStr
      ).length;

      userTrends.push({
        date: date.format(dateFormat),
        day: date.format('ddd'),
        fullDate: dateStr,
        doctors,
        owners,
        total: doctors + owners
      });
    }

    // Appointment trends
    const appointmentTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');

      const count = allAppointments.filter(a =>
        moment(a.appointmentDate).format('YYYY-MM-DD') === dateStr
      ).length;

      appointmentTrends.push({
        date: date.format(dateFormat),
        day: date.format('ddd'),
        fullDate: dateStr,
        count
      });
    }

    // 5. GROWTH METRICS
    const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();

    const [newUsersLast30Days, newDoctorsLast30Days, newPetOwnersLast30Days] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: "Doctor", createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: "PetOwner", createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Appointment growth
    const last7Days = moment().subtract(7, 'days').startOf('day').toDate();
    const previous7Days = moment().subtract(14, 'days').startOf('day').toDate();

    const [appointmentsLast7Days, appointmentsPrevious7Days] = await Promise.all([
      DoctorAppointment.countDocuments({ createdAt: { $gte: last7Days } }),
      DoctorAppointment.countDocuments({
        createdAt: { $gte: previous7Days, $lt: last7Days }
      })
    ]);

    const appointmentGrowth = appointmentsPrevious7Days > 0
      ? ((appointmentsLast7Days - appointmentsPrevious7Days) / appointmentsPrevious7Days * 100).toFixed(1)
      : appointmentsLast7Days > 0 ? "100.0" : "0.0";

    // 6. SYSTEM HEALTH
    const systemHealth = {
      verifiedUsers,
      unverifiedUsers,
      activeDoctors: approvedDoctors,
      pendingVerifications: pendingDoctors,
      rejectedVerifications: rejectedDoctors,
      totalAppointments,
      todayAppointments,
      paidAppointments,
      unpaidAppointments,
      totalPets
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDoctors,
          totalPetOwners,
          totalAdmins,
          verifiedUsers,
          unverifiedUsers,
          approvedDoctors,
          pendingDoctors,
          rejectedDoctors,
          totalPets,
          petsByType
        },
        appointments: {
          total: totalAppointments,
          today: todayAppointments,
          byStatus: appointmentsByStatus,
          byType: appointmentsByType,
          payment: {
            paid: paidAppointments,
            unpaid: unpaidAppointments
          },
          trends: appointmentTrends
        },
        ratings: {
          platformAverage: avgPlatformRating,
          lowRatedDoctors,
          totalDoctorsWithReviews: doctorsWithReviews.length
        },
        growth: {
          newUsersLast30Days,
          newDoctorsLast30Days,
          newPetOwnersLast30Days,
          appointmentGrowth,
          userTrends,
          selectedPeriod: activePeriod
        },
        systemHealth
      }
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get admin verification queue
// @route   GET /api/dashboard/admin/verification-queue
const getVerificationQueue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const queueData = await DoctorProfile.find({
      "verificationUploads.status": "Pending"
    })
      .populate("userId", "fullName email phone createdAt")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await DoctorProfile.countDocuments({
      "verificationUploads.status": "Pending"
    });

    const queue = queueData.map(d => {
      let userId = d._id.toString(); // fallback to profile ID
      let doctorName = "Unknown";
      let email = "";
      let phone = "";

      if (d.userId) {
        if (typeof d.userId === 'object' && d.userId._id) {
          userId = d.userId._id.toString();
          doctorName = d.userId.fullName || "Unknown";
          email = d.userId.email || "";
          phone = d.userId.phone || "";
        } else if (typeof d.userId === 'string') {
          userId = d.userId;
        }
      }

      return {
        id: userId,
        doctorName: doctorName,
        email: email,
        phone: phone,
        specialization: d.specialization || "Veterinarian",
        pvmcNumber: d.pvmcRegistrationNumber || "",
        submittedAt: d.createdAt,
        timeAgo: d.createdAt ? moment(d.createdAt).fromNow() : "N/A",
        licenseImage: d.verificationUploads?.veterinaryLicense || null
      };
    });

    res.json({
      success: true,
      data: queue,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Verification queue error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top performing doctors
// @route   GET /api/dashboard/admin/top-doctors
const getTopDoctors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const doctorsData = await DoctorProfile.find({
      numReviews: { $gt: 0 }
    })
      .populate("userId", "fullName email")
      .sort({ rating: -1, numReviews: -1 })
      .limit(parseInt(limit))
      .lean();

    const topDoctors = doctorsData.map(d => {
      let userId = d._id.toString(); // fallback to profile ID
      let doctorName = "Unknown";

      if (d.userId) {
        if (typeof d.userId === 'object' && d.userId._id) {
          userId = d.userId._id.toString();
          doctorName = d.userId.fullName || "Unknown";
        } else if (typeof d.userId === 'string') {
          userId = d.userId;
        }
      }

      return {
        id: userId,
        name: doctorName,
        specialization: d.specialization || "Veterinarian",
        rating: d.rating ? d.rating.toFixed(1) : "0.0",
        reviews: d.numReviews || 0,
        image: d.image || null,
        experience: d.yearsOfExperience || 0
      };
    });

    res.json({
      success: true,
      data: topDoctors
    });
  } catch (error) {
    console.error("Top doctors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor dashboard stats (lightweight)
// @route   GET /api/dashboard/doctor/stats
const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [
      totalAppointments,
      pendingAppointments,
      todayAppointments,
      doctorProfile
    ] = await Promise.all([
      DoctorAppointment.countDocuments({ doctorId }),
      DoctorAppointment.countDocuments({
        doctorId,
        status: "Scheduled"
      }),
      DoctorAppointment.countDocuments({
        doctorId,
        appointmentDate: {
          $gte: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      }),
      DoctorProfile.findOne({ userId: doctorId })
    ]);

    const uniquePatients = await DoctorAppointment.distinct("ownerId", { doctorId });

    res.json({
      success: true,
      data: {
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        rating: doctorProfile?.rating || 0,
        totalReviews: doctorProfile?.numReviews || 0,
        uniquePatients: uniquePatients.length
      }
    });
  } catch (error) {
    console.error("Doctor dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor appointment trends
// @route   GET /api/dashboard/doctor/trends
const getDoctorAppointmentTrends = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const doctorId = req.user._id;

    let days = 7;
    if (period === "month") days = 30;
    if (period === "year") days = 365;

    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const count = await DoctorAppointment.countDocuments({
        doctorId,
        appointmentDate: {
          $gte: date.startOf('day').toDate(),
          $lt: date.endOf('day').toDate()
        }
      });

      trends.push({
        date: date.format('YYYY-MM-DD'),
        day: date.format('ddd'),
        count
      });
    }

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error("Doctor appointment trends error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor alerts
// @route   GET /api/dashboard/doctor/alerts
const getDoctorAlerts = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    const alerts = [];

    // Verification status alert
    const verificationStatus = doctorProfile?.verificationUploads?.status || "Pending";
    if (verificationStatus === "Pending") {
      alerts.push({
        id: "verification-pending",
        type: "warning",
        title: "Verification Pending",
        message: "Your license is under review. Please allow 24-48 hours for verification.",
        action: "/doctor/profile"
      });
    } else if (verificationStatus === "Rejected") {
      alerts.push({
        id: "verification-rejected",
        type: "error",
        title: "Verification Rejected",
        message: "Your license was rejected. Please upload a clearer image.",
        action: "/doctor/profile"
      });
    }

    // Pending appointments
    const pendingCount = await DoctorAppointment.countDocuments({
      doctorId,
      status: "Scheduled"
    });

    if (pendingCount > 0) {
      alerts.push({
        id: "pending-appointments",
        type: "info",
        title: "Pending Actions",
        message: `You have ${pendingCount} appointment${pendingCount > 1 ? 's' : ''} waiting for your response.`,
        action: "/doctor/doctor-appointments"
      });
    }

    // Tomorrow's appointments
    const tomorrow = moment().add(1, 'day');
    const tomorrowCount = await DoctorAppointment.countDocuments({
      doctorId,
      appointmentDate: {
        $gte: tomorrow.startOf('day').toDate(),
        $lt: tomorrow.endOf('day').toDate()
      },
      status: { $in: ["Scheduled", "Accepted", "Rescheduled"] }
    });

    if (tomorrowCount > 0) {
      alerts.push({
        id: "tomorrow-appointments",
        type: "info",
        title: "Tomorrow's Schedule",
        message: `You have ${tomorrowCount} appointment${tomorrowCount > 1 ? 's' : ''} scheduled for tomorrow.`,
        action: "/doctor/doctor-appointments"
      });
    }

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Doctor alerts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export all controller functions
export {
  getDoctorDashboard,
  getAdminDashboard,
  getDoctorDashboardStats,
  getDoctorAppointmentTrends,
  getDoctorAlerts,
  getVerificationQueue,
  getTopDoctors
};