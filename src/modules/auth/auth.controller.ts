import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { Public } from '../../common/decorators/public.decorator.js'
import { RequireRoles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { AuthorizeGuard } from '../../common/guards/authorization.guard.js';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { tokenTypes } from '../../common/enums/token.js';
import { TokenType } from '../../common/decorators/token-type.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { UserDocument } from '../../models/user.model.js';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor.js';
import { TimeoutInterceptor } from '../../common/interceptors/timeout.interceptor.js';

@UseInterceptors(LoggingInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseInterceptors(TimeoutInterceptor)
  @Post()
  create(@Body() createAuthDto: SignupDto) {
    return this.authService.signup(createAuthDto);
  }


  // @RequireRoles(Role.ADMIN)
  // @TokenType(tokenTypes.ACCESS)
  @Auth({
    roles: [Role.ADMIN],
    tokenType: tokenTypes.ACCESS,
  })
  @Delete()
  delete(@CurrentUser() user: UserDocument) {
    return "Deleted"
  }


}
