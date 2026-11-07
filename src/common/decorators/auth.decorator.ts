
import { applyDecorators } from '@nestjs/common';

import { RequireRoles } from './roles.decorator.js';
import { TokenType } from './token-type.decorator.js';

import { Role } from '../enums/role.js';
import { tokenTypes } from '../enums/token.js';

interface AuthOptions {
  roles?: Role[];
  tokenType?: tokenTypes;
}

export function Auth(options: AuthOptions = {}) {
  return applyDecorators(
    RequireRoles(...(options.roles ?? [])),
    TokenType(options.tokenType ?? tokenTypes.ACCESS),
  );
}
