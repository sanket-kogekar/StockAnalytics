export enum TrendTypeEnum {
  // BUY
  RED_RED_GREEN = 'RED_RED_GREEN',
  RED_GREEN_GREEN = 'RED_GREEN_GREEN',
  GREEN_GREEN_GREEN = 'GREEN_GREEN_GREEN',
  // SELL
  GREEN_GREEN_RED = 'GREEN_GREEN_RED',
  GREEN_RED_RED = 'GREEN_RED_RED',
  RED_RED_RED = 'RED_RED_RED',
  // NEUTRAL
  RED_GREEN_RED = 'RED_GREEN_RED',
  GREEN_RED_GREEN = 'GREEN_RED_GREEN',
}

export enum SignalTypeEnum {
  // BUY
  BUY = 'BUY',
  STRONG_BUY = 'STRONG_BUY',
  BUY_STOCK_ON_UPTREND = 'BUY_STOCK_ON_UPTREND',
  // SELL
  SELL = 'SELL',
  STRONG_SELL = 'STRONG_SELL',
  SELL_STOCK_ON_DOWNTREND = 'SELL_STOCK_ON_DOWNTREND',
  // NEUTRAL
  NEUTRAL_BUY = 'NEUTRAL_BUY',
  NEUTRAL_SELL = 'NEUTRAL_SELL',
}

export enum PeriodEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ExchangeEnum {
  BSE = 'BSE',
  NSE = 'NSE',
}

export enum CandleColor {
  GREEN = 'GREEN',
  RED = 'RED',
}

export enum SingleSignal {
  TRUE_BUY = `true(BUY!)`,
  FALSE_SELL = 'false(SELL!)',
}
