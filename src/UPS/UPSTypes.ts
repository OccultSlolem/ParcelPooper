export interface UPSErrorDetail {
  code: string;
  message: string;
}

export interface UPSError {
  errors: UPSErrorDetail[];
}

export function isUPSError(obj: any): obj is UPSError {
  return (
    obj &&
    Array.isArray(obj.errors) &&
    obj.errors.every((error: any) => {
      return (
        typeof error.code === 'string' &&
        typeof error.message === 'string'
      );
    })
  );
}
