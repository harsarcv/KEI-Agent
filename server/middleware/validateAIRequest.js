const validateAIRequest = (req, res, next) => {
  const { message } = req.body;

  if (typeof message !== "string") {
    return res.status(400).json({
      success: false,
      message: "Message harus berupa teks",
    });
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return res.status(400).json({
      success: false,
      message: "Message tidak boleh kosong",
    });
  }

  if (trimmedMessage.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Message terlalu panjang. Maksimal 2000 karakter",
    });
  }

  req.body.message = trimmedMessage;

  next();
};

module.exports = validateAIRequest;