
import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto.js';
import { UserRepository } from '../../repository/user.repository.js';
import { SecurityService } from '../../common/modules/security/security.service.js';
import { RedisService } from '../../common/modules/redis/redis.service.js';
import { generateOtp } from '../../common/utils/generate-otp.js';
import emailEmitter from '../../common/utils/email-event.js';
import { otpEmail } from '../../common/templates/emails/otp.js';
import { EmailService } from '../../common/modules/email/email.service.js';
import { TokenService } from '../../common/service/token.service.js';
import { Role } from '../../common/enums/role.js';

@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private securityService: SecurityService,
    private redisService: RedisService,
    private emailService: EmailService,
    private tokenService: TokenService
  ) { }



  async signup(data: SignupDto) {
    const user = await this.userRepo.findOne({
      filter: {
        email: data.email,
      },
    });
    if (user) {
      throw new ConflictException("email exist")
    }

    const newUser = await this.userRepo.create({
      ...data,
      role: Role.USER,
    }
    );

    const otp = await generateOtp();
    const hasedOtp = await this.securityService.hashValue(otp)

    await this.redisService.set({
      key: this.redisService.otpKey({
        email: newUser.email
      }),
      ttl: 120,
      value: hasedOtp
    })

    await this.redisService.set({
      key: this.redisService.otpCountKey({
        email: newUser.email
      }),
      ttl: 300,
      value: 1
    })


    emailEmitter.emit('sendEmail', async () => {
      await this.emailService.sendEmail({
        to: newUser.email,
        subject: 'confirm email',
        html: otpEmail({
          otp,
          name: newUser.fname,
          title: 'confirm email otp',
          expiresIn: "2 minutes"
        }),
      });
    });

    return { user };
  }

}
