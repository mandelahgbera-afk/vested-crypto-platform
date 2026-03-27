import { supabase, createActivityLog, getUserHoldings, updateUserHolding, createUserHolding, getTraderById } from './supabase';

/**
 * COPY TRADING EXECUTION SYSTEM
 * Handles automated execution of trades for users following traders
 */

/**
 * Execute copy trade - Called when a trader makes a trade
 * This function finds all followers of the trader and executes proportional trades for them
 */
export async function executeCopyTrade(
  traderId: string,
  cryptoSymbol: string,
  amount: number,
  tradeType: 'buy' | 'sell',
  profitPercentage: number = 0
) {
  try {
    // Get trader details
    const trader = await getTraderById(traderId);
    if (!trader) {
      throw new Error('Trader not found');
    }

    // Get all users following this trader
    const { data: followers, error: followerError } = await supabase
      .from('user_traders')
      .select('user_id')
      .eq('trader_id', traderId);

    if (followerError) throw followerError;
    if (!followers || followers.length === 0) {
      console.log(`No followers for trader ${traderId}`);
      return;
    }

    // Execute trade for each follower
    const tradePromises = followers.map((follower) =>
      executeCopyTradeForUser(
        follower.user_id,
        traderId,
        trader.name,
        cryptoSymbol,
        amount,
        tradeType,
        profitPercentage
      )
    );

    await Promise.all(tradePromises);
    console.log(`Executed copy trade for ${followers.length} followers`);
  } catch (error) {
    console.error('Copy trading execution error:', error);
    throw error;
  }
}

/**
 * Execute a single copy trade for a user
 */
async function executeCopyTradeForUser(
  userId: string,
  _traderId: string,
  traderName: string,
  cryptoSymbol: string,
  amount: number,
  tradeType: 'buy' | 'sell',
  profitPercentage: number
) {
  try {
    // Copy with 10% of trader's trade amount (proportional scaling)
    const copyAmount = amount * 0.1;

    // Get user's current holdings
    const holdings = await getUserHoldings(userId);
    const holding = holdings.find((h) => h.crypto?.symbol === cryptoSymbol);

    if (tradeType === 'buy') {
      // For buy: increase balance
      if (holding && holding.id) {
        const newBalance = (holding.balance || 0) + copyAmount;
        await updateUserHolding(holding.id, { balance: newBalance });
      } else {
        // Create new holding if doesn't exist
        const crypto = await getCryptoBySymbol(cryptoSymbol);
        if (crypto) {
          await createUserHolding(userId, crypto.id, copyAmount);
        }
      }

      // Create activity log
      await createActivityLog({
        user_id: userId,
        type: 'receive',
        amount: copyAmount,
        crypto_symbol: cryptoSymbol,
        description: `Copy trade: Bought ${copyAmount} ${cryptoSymbol} following ${traderName}`,
        timestamp: new Date().toISOString(),
      });
    } else if (tradeType === 'sell') {
      // For sell: decrease balance (if sufficient)
      if (holding && holding.id && (holding.balance || 0) >= copyAmount) {
        const newBalance = (holding.balance || 0) - copyAmount;
        await updateUserHolding(holding.id, { balance: newBalance });

        // Create activity log
        await createActivityLog({
          user_id: userId,
          type: 'send',
          amount: copyAmount,
          crypto_symbol: cryptoSymbol,
          description: `Copy trade: Sold ${copyAmount} ${cryptoSymbol} following ${traderName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.warn(
          `User ${userId} doesn't have enough balance to copy sell trade for ${cryptoSymbol}`
        );
      }
    }

    // If trade was profitable, update user's total profit
    if (profitPercentage > 0) {
      const profitAmount = copyAmount * (profitPercentage / 100);
      await updateUserProfitLoss(userId, profitAmount);
    }

    return true;
  } catch (error) {
    console.error(`Error executing copy trade for user ${userId}:`, error);
    return false;
  }
}

/**
 * Update user's total profit/loss
 */
async function updateUserProfitLoss(userId: string, amount: number) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('profit_loss')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newProfitLoss = (user?.profit_loss || 0) + amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ profit_loss: newProfitLoss })
      .eq('id', userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating user profit/loss:', error);
  }
}

/**
 * Get crypto by symbol (helper function)
 */
async function getCryptoBySymbol(symbol: string) {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching crypto ${symbol}:`, error);
    return null;
  }
}

/**
 * Simulate trader performance update
 * Called by admin to simulate a trader making a trade with profit
 */
export async function simulateTraderTrade(
  traderId: string,
  cryptoSymbol: string,
  simulatedProfitPercentage: number
) {
  try {
    // Update trader's profit metrics
    const trader = await getTraderById(traderId);
    if (!trader) throw new Error('Trader not found');

    // Update trader's performance
    const newProfit = trader.total_profit_loss + simulatedProfitPercentage;
    const { error: updateError } = await supabase
      .from('traders')
      .update({
        total_profit_loss: newProfit,
        profit_loss_percentage: newProfit / 100, // Simplified calculation
        updated_at: new Date().toISOString(),
      })
      .eq('id', traderId);

    if (updateError) throw updateError;

    // Execute copy trades for all followers with the simulated profit
    const tradeAmount = Math.abs(simulatedProfitPercentage) * 100; // Arbitrary amount for simulation
    await executeCopyTrade(traderId, cryptoSymbol, tradeAmount, 'buy', simulatedProfitPercentage);

    console.log(`Simulated trader ${traderId} with ${simulatedProfitPercentage}% profit`);
    return true;
  } catch (error) {
    console.error('Error simulating trader trade:', error);
    throw error;
  }
}

/**
 * Auto-execute copy trades based on trader's transaction history
 * This would be called periodically to sync copy trades with real trader trades
 */
export async function syncCopyTradesWithTraderActivity(traderId: string) {
  try {
    // Get trader's recent transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('trader_id', traderId)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Execute copy trades for each transaction
    const syncPromises = (transactions || []).map((transaction) =>
      executeCopyTrade(
        traderId,
        transaction.crypto_symbol,
        transaction.amount,
        transaction.type as 'buy' | 'sell',
        0
      )
    );

    await Promise.all(syncPromises);
    console.log(`Synced ${transactions?.length || 0} copy trades for trader ${traderId}`);
  } catch (error) {
    console.error('Error syncing copy trades:', error);
    throw error;
  }
}
