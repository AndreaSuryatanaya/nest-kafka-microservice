import { Injectable, OnModuleInit } from '@nestjs/common';
import { V4 } from 'paseto';
import { KeyObject, createPublicKey } from 'crypto';

export interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
}

@Injectable()
export class PasetoService implements OnModuleInit {
  private privateKey!: KeyObject;
  private publicKey!: KeyObject;

  async onModuleInit() {
    // Generate asymmetric key pair for PASETO v4.public tokens
    // In production, these should be stored securely and persist across restarts
    this.privateKey = await V4.generateKey('public');
    // Extract public key from private key
    this.publicKey = createPublicKey(this.privateKey);
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    // Use V4.sign for public (asymmetric) tokens
    const token = await V4.sign(
      {
        ...payload,
        iat: new Date().toISOString(),
        exp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
      this.privateKey
    );

    return token;
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      // Use V4.verify for public (asymmetric) tokens
      const payload = await V4.verify(token, this.publicKey);
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }
}
