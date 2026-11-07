import { SetMetadata } from '@nestjs/common';
import { tokenTypes } from '../enums/token.js';

export const TOKEN_TYPE_KEY = 'tokenType';

export const TokenType = (type: tokenTypes) =>
  SetMetadata(TOKEN_TYPE_KEY, type);