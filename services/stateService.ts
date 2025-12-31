
import { User, Match, Transaction, AppNotification, UserRole, MatchPlayer } from '../types';
import { supabase } from './supabase';

class StateService {
  private mapUser(u: any): User {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      pin: u.pin,
      role: u.role as UserRole,
      balance: u.balance,
      isBlocked: u.is_blocked,
      isDeleted: u.is_deleted,
      canCreateMatch: u.can_create_match,
      totalMatchesPaid: u.total_matches_paid,
      createdAt: new Date(u.created_at).getTime()
    };
  }

  private mapMatch(m: any): Match {
    return {
      id: m.id,
      name: m.name,
      teamA: m.team_a,
      teamB: m.team_b,
      winningTeam: m.winning_team,
      status: m.status,
      createdAt: new Date(m.created_at).getTime()
    };
  }

  private mapNotification(n: any): AppNotification {
    return {
      id: n.id,
      userId: n.user_id,
      message: n.message,
      timestamp: new Date(n.created_at).getTime(),
      isRead: n.is_read
    };
  }

  private mapTransaction(t: any): Transaction {
    return {
      id: t.id,
      userId: t.user_id,
      amount: t.amount,
      type: t.type,
      description: t.description,
      timestamp: new Date(t.created_at).getTime()
    };
  }

  async getUsers(includeDeleted = false): Promise<User[]> {
    let query = supabase.from('users').select('*');
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapUser);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error || !data) return undefined;
    return this.mapUser(data);
  }

  async login(email: string, pin: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('pin', pin)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Signal Mismatch: Invalid Credentials Checkpoint.');
    }

    const user = this.mapUser(data);
    if (user.isDeleted) throw new Error('Account purged from battlefield.');
    if (user.isBlocked) throw new Error('Operative blocked by High Command.');

    return user;
  }
  
  async addUser(user: Partial<User>): Promise<User> {
    const newUser = {
      username: user.username?.toUpperCase().trim(),
      email: user.email?.toLowerCase().trim(),
      pin: user.pin || '000000',
      role: user.role || UserRole.PLAYER,
      balance: user.balance || 0,
      is_blocked: false,
      is_deleted: false,
      can_create_match: user.canCreateMatch || false,
      total_matches_paid: 0
    };

    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;
    return this.mapUser(data);
  }

  async updateUser(id: string, updates: Partial<User>) {
    const dbUpdates: any = {};
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.pin !== undefined) dbUpdates.pin = updates.pin;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
    if (updates.isDeleted !== undefined) dbUpdates.is_deleted = updates.isDeleted;
    if (updates.canCreateMatch !== undefined) dbUpdates.can_create_match = updates.canCreateMatch;
    if (updates.totalMatchesPaid !== undefined) dbUpdates.total_matches_paid = updates.totalMatchesPaid;

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }

  async adminAdjustBalance(adminId: string, targetUserId: string, amount: number, reason: string) {
    const target = await this.getUserById(targetUserId);
    if (!target) throw new Error("Unit Not Found.");

    const newBalance = target.balance + amount;
    await this.updateUser(targetUserId, { balance: newBalance });

    await supabase.from('transactions').insert([{
      user_id: targetUserId,
      amount,
      type: 'ADMIN_ADJUST',
      description: `[ADMIN OVERRIDE] ${reason}`
    }]);

    await this.addNotification(targetUserId, `Financial Protocol: Command has ${amount >= 0 ? 'credited' : 'debited'} ₹${Math.abs(amount)} to your grid wallet. Reason: ${reason}`);
  }

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').update({ is_deleted: true }).eq('id', id);
    if (error) throw error;
  }

  async resetPassword(adminId: string, userId: string, newPin: string) {
    await this.updateUser(userId, { pin: newPin });
    await this.addNotification(userId, "Security Alert: High Command has reconfigured your security PIN.");
  }

  async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapMatch);
  }
  
  async createMatch(name: string, teamA: MatchPlayer[], teamB: MatchPlayer[], creatorId: string): Promise<Match> {
    const creator = await this.getUserById(creatorId);
    if (!creator || (!creator.canCreateMatch && creator.role !== UserRole.ADMIN)) {
      throw new Error("Clearance Error: Match initialization blocked.");
    }

    const finalName = name.trim() || `ENGAGEMENT_${Date.now()}`;
    const newMatch = {
      name: finalName,
      team_a: teamA,
      team_b: teamB,
      status: 'UNDECIDED',
      winning_team: null
    };
    
    const { data, error } = await supabase.from('matches').insert([newMatch]).select().single();
    if (error) throw error;

    for (const p of [...teamA, ...teamB]) {
      await this.addNotification(p.userId, `New Combat Assignment: You have been deployed to ${finalName}. Stakes: ₹${p.betAmount}.`);
    }

    return this.mapMatch(data);
  }

  async settleMatch(matchId: string, winningTeam: 'A' | 'B') {
    const { data: matchRaw, error: fetchError } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (fetchError || matchRaw.status === 'SETTLED') return;

    const match = this.mapMatch(matchRaw);
    await supabase.from('matches').update({ winning_team: winningTeam, status: 'SETTLED' }).eq('id', matchId);

    const winners = winningTeam === 'A' ? match.teamA : match.teamB;
    const losers = winningTeam === 'A' ? match.teamB : match.teamA;

    // Credit winners
    for (const p of winners) {
      const u = await this.getUserById(p.userId);
      if (u) {
        await this.updateUser(p.userId, { balance: u.balance + p.betAmount });
        await supabase.from('transactions').insert([{
          user_id: p.userId,
          amount: p.betAmount,
          type: 'WIN',
          description: `Combat Victory: ${match.name}`
        }]);
        await this.addNotification(p.userId, `VICTORY: Your squad dominated ${match.name}. ₹${p.betAmount} credited to grid.`);
      }
    }

    // Debit losers
    for (const p of losers) {
      const u = await this.getUserById(p.userId);
      if (u) {
        await this.updateUser(p.userId, { balance: u.balance - p.betAmount });
        await supabase.from('transactions').insert([{
          user_id: p.userId,
          amount: -p.betAmount,
          type: 'LOSS',
          description: `Combat Defeat: ${match.name}`
        }]);
        await this.addNotification(p.userId, `DEFEAT: Your squad was neutralized in ${match.name}. ₹${p.betAmount} debited from grid.`);
      }
    }
  }

  async markLoserAsPaid(matchId: string, userId: string) {
    const { data: mData } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (!mData) return;

    const match = this.mapMatch(mData);
    const losers = match.winningTeam === 'A' ? match.teamB : match.teamA;
    const winners = match.winningTeam === 'A' ? match.teamA : match.teamB;
    
    const pIdx = losers.findIndex(p => p.userId === userId);
    if (pIdx !== -1 && !losers[pIdx].paid) {
      losers[pIdx].paid = true;
      
      const updateData = match.winningTeam === 'A' ? { team_b: losers } : { team_a: losers };
      await supabase.from('matches').update(updateData).eq('id', matchId);
      
      // Credit back the loser since they paid out of pocket (adjusting balance back to neutral for this specific loss)
      const u = await this.getUserById(userId);
      if (u) {
        await this.updateUser(userId, { balance: u.balance + losers[pIdx].betAmount, totalMatchesPaid: u.totalMatchesPaid + 1 });
        await supabase.from('transactions').insert([{
          user_id: userId,
          amount: losers[pIdx].betAmount,
          type: 'PAYMENT_CLEAR',
          description: `Debt Settled: ${match.name}`
        }]);
      }
      
      // Winners are already credited the "win", we don't need to double credit. 
      // This logic depends on how you want to handle "Paid" status.
      await this.addNotification(userId, `Grid Clear: Your debt for ${match.name} has been processed by High Command.`);
    }
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(t => this.mapTransaction(t));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(t => this.mapTransaction(t));
  }

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(n => this.mapNotification(n));
  }

  async addNotification(userId: string, message: string) {
    await supabase.from('notifications').insert([{ user_id: userId, message, is_read: false }]);
  }

  async markAllNotificationsRead(userId: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  }
}

export const stateService = new StateService();
