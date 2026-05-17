import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { referrals: true }
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      telegramId: user.telegramId.toString(),
    };
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const totalEarned = await this.prisma.transaction.aggregate({
      where: { userId, type: { not: 'WITHDRAWAL' } },
      _sum: { amount: true },
    });

    return {
      balance: user.balance,
      totalEarned: totalEarned._sum.amount || 0,
      referralCount: await this.prisma.user.count({ where: { referredById: userId } }),
      dailyAdsRemaining: 20 - user.dailyAdsCount, // Example limit
    };
  }
}
