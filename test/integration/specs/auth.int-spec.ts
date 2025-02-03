import { Test } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { DbService } from "@src/db/db.service";
import { AuthService } from "@src/auth/auth.service";
import {
  CreateUserDto,
  LoginDto,
  NewPasswordDto,
  PasswordResetDto,
  Verify2FADto,
  VerifyOTPDto
} from "@src/auth/dto";
import { SessionService } from "@src/common/session";
import { SessionData } from "@src/common/types";

describe('Auth Service', () => {
  let prisma: DbService;
  let authService: AuthService;
  let session: SessionService;
  let userId: number;
  let otp: string;
  let data: SessionData = {};

  const signupDto: CreateUserDto = {
    email: 'auth@example.com',
    password: 'password',
    firstName: 'Xerdin',
    lastName: 'Ludac'
  };

  beforeAll(async () => {
    jest.useRealTimers();
    
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    // Creating and initializing Nest application
    const app = moduleRef.createNestApplication();

    // Cleaning database and session store before running tests
    prisma = app.get(DbService);
    await prisma.cleanDb();

    session = app.get(SessionService);
    await session.onModuleInit();
    await session.clear();

    authService = app.get(AuthService);
  });

  describe('Signup', () => {
    it('should signup a new user', async () => {
      const { user } = await authService.signup(signupDto);
      userId = user.id;
    }, 30000);

    it('should throw if email already exists', async () => {
      await expect(authService.signup(signupDto))
        .rejects.toThrow('This email already exists. Please try again!');
    }, 30000);
  });

  describe('Login', () => {
    const dto: LoginDto = {
      email: signupDto.email,
      password: signupDto.password
    };

    it('should throw if no user exists with given email', async () => {
      await expect(authService.login({
        ...dto,
        email: 'wrongemail@gmail.com'
      }))
        .rejects.toThrow('No user found with that email address');
    });

    it('should throw if password is invalid', async () => {
      await expect(authService.login({
        ...dto,
        password: 'wrong-password'
      }))
        .rejects.toThrow('Invalid password');
    });

    it('should login existing user', async () => {
      await authService.login(dto);
    })
  });

  describe('Enable 2FA', () => {
    it('should turn on 2FA for user', async () => {
      await authService.enable2FA(userId);
    })
  });

  describe('Disable 2FA', () => {
    it('should turn off 2FA for user', async () => {
      await authService.disable2FA(userId);
    })
  });

  describe('Verify 2FA', () => {
    it('should verify 2FA token', async () => {
      const dto: Verify2FADto = {
        token: '123456'
      };

      await authService.verify2FA(userId, dto);
    })
  });

  describe('Request Password Reset', () => {
    it('should throw if no user exists with given email', async () => {
      await expect(authService.requestPasswordReset({ email: 'wrong@email.com' }, data))
        .rejects.toThrow('No user found with that email address');
    });

    it('should send password reset OTP to user email', async () => {
      const dto: PasswordResetDto = {
        email: signupDto.email
      };

      otp = await authService.requestPasswordReset(dto, data);
    })
  });

  describe('Resend Password OTP', () => {
    it('should re-send password reset OTP to user email', async () => {
      otp = await authService.resendOTP(data);
    })
  });

  describe('Verify Password OTP', () => {
    it('should throw if password reset OTP is invalid', async () => {
      await expect(authService.verifyOTP({ otp: '1234' }, data))
        .rejects.toThrow('Invalid OTP');
    });

    it('should verify password reset OTP', async () => {
      const dto: VerifyOTPDto = { otp };
      await authService.verifyOTP(dto, data);
    });
  });

  describe('Change Password', () => {
    it('should throw if new password is same as previous password', async () => {
      await expect(authService.changePassword({ newPassword: signupDto.password }, data))
        .rejects.toThrow('New password cannot be the same value as previous password');
    });

    it('should change password and complete reset', async () => {
      const dto: NewPasswordDto = {
        newPassword: 'PassWord'
      };

      await authService.changePassword(dto, data);
    });
  });

  describe('Logout', () => {
    it('should logout of current session', async () => {
      await authService.logout(signupDto.email);
    })
  });
})