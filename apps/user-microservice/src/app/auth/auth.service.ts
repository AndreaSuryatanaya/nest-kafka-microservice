import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository, User } from './user.repository';
import { PasetoService, TokenPayload } from './paseto.service';
import { RegisterDto, LoginDto } from './dto';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly pasetoService: PasetoService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email || ''
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userRepository.create({
      email: registerDto.email || '',
      password: registerDto.password || '',
      name: registerDto.name || '',
    });

    // Generate PASETO token
    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await this.pasetoService.generateToken(tokenPayload);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email || '');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password
    const isValidPassword = await this.userRepository.validatePassword(
      loginDto.password || '',
      user.password
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate PASETO token
    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await this.pasetoService.generateToken(tokenPayload);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    return this.pasetoService.verifyToken(token);
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
