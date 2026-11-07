import type { User } from '../../users/entities/user.entity.js';
import type { AccessTokenPayload } from '../interfaces/token.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      payload?: AccessTokenPayload;
    }

  }
  namespace Multer {
    interface File {
      finalPath?: string;
    }
  }
}

export { };