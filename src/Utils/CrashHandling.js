export const tryCatch = (controller) =>
  async function (req, res, next) {
    try {
      await controller(req, res, next);
    } catch (e) {
      return next(e);
    }
  };
