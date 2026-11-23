export class ApiError extends Error {
  constructor(status, path) {
    super(`HTTP ${status} sur ${path}`);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}
