import { ERROR_TYPES } from "./eErrors.js";
import { errorMsg } from "./errorMsg.js";

export class CustomError {
  static createError(name = "Error", cause, message, code = ERROR_TYPES.INTERNAL_SERVER_ERROR) {
    const Msg = errorMsg(name, message, cause);
    const error = new Error(message);
    error.name = name;
    error.code = code;
    error.cause = cause;
    error.Msg = Msg;

    throw error;
  }
}
