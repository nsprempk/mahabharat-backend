import Chapter from "../models/Chapter.js";

export const getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find().sort({ number: 1 });

    res.json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      number: Number(req.params.number),
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    res.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
