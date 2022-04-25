import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import {
  CandleColor,
  ExchangeEnum,
  PeriodEnum,
  SignalTypeEnum,
  SingleSignal,
  TrendTypeEnum,
} from "./trendType.enum";

@Injectable()
export class AppService {
  async getHeikinAshiBarsForScrip(
    scrip: string,
    period: PeriodEnum
  ): Promise<{
    scrip: string;
    trend: TrendTypeEnum;
    signal: SignalTypeEnum;
    history: any[];
  }> {
    const myScrip = scrip.toUpperCase();
    let response: any;
    try {
      response = await this.getScripDetails(myScrip, period);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error in getScripDetails() from getHeikinAshiBarsForScrip() ${error}`
      );
    }

    if (!!response && !!response.candles && response.candles.length > 0) {
      let candleValues = response.candles;
      candleValues.reverse();
      candleValues = candleValues.slice(0, 40);

      const candleOhlc = candleValues.map((item: number[]) => {
        let date = new Date(item[0] * 1000);
        const realDate =
          date.getDate() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getFullYear();
        return {
          date: `${realDate}`,
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        };
      });

      candleOhlc.reverse();
      const ohlc = [];

      candleOhlc.forEach((item, index) => {
        if (index === 0) {
          // Original OHLC is used to create first Heikin Ashi Candle OHLC.
          const heikinAshiClose =
            (item.open + item.high + item.low + item.close) / 4;
          const heikinAshiOpen = (item.open + item.close) / 2;

          ohlc.push({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            boxFat: Math.abs(item.close) - Math.abs(item.open),
            trueColor:
              item.close > item.open ? CandleColor.GREEN : CandleColor.RED,
            heikinOpen: heikinAshiOpen,
            heikinHigh: item.high,
            heikinLow: item.low,
            heikinClose: heikinAshiClose,
            heikinBoxFat: Math.abs(heikinAshiClose) - Math.abs(heikinAshiOpen),
            heikinColor:
              heikinAshiClose > heikinAshiOpen
                ? CandleColor.GREEN
                : CandleColor.RED,

            priceChangePercentage: ((item.close - item.open) / item.open) * 100,
          });
        } else {
          const currentCandleHeikinClose =
            (item.open + item.high + item.low + item.close) / 4;
          const currentCandleHeikinOpen =
            (ohlc[ohlc.length - 1].heikinOpen +
              ohlc[ohlc.length - 1].heikinClose) /
            2;
          const currentCandleHeikinHigh = Math.max(
            item.high,
            currentCandleHeikinOpen,
            currentCandleHeikinClose
          );
          const currentCandleHeikinLow = Math.min(
            item.low,
            currentCandleHeikinOpen,
            currentCandleHeikinClose
          );
          const boxFat = Math.abs(item.close) - Math.abs(item.open);
          const heikinBoxFat =
            Math.abs(currentCandleHeikinClose) -
            Math.abs(currentCandleHeikinOpen);
          const priceChangePercentage =
            ((item.close - item.open) / item.open) * 100;
          const heikinLowChangePercentage =
            ((currentCandleHeikinLow - ohlc[ohlc.length - 1].heikinLow) /
              ohlc[ohlc.length - 1].heikinLow) *
            100;
          const heikinHighChangePercentage =
            ((currentCandleHeikinHigh - ohlc[ohlc.length - 1].heikinHigh) /
              ohlc[ohlc.length - 1].heikinHigh) *
            100;
          const heikinBoxChangePercentage =
            ((heikinBoxFat - ohlc[ohlc.length - 1].heikinBoxFat) /
              ohlc[ohlc.length - 1].heikinBoxFat) *
            100;
          const boxChangePercentage =
            ((boxFat - ohlc[ohlc.length - 1].boxFat) /
              ohlc[ohlc.length - 1].boxFat) *
            100;
          const heikinColor =
            currentCandleHeikinClose > currentCandleHeikinOpen
              ? CandleColor.GREEN
              : CandleColor.RED;
          const hasSameColorAsLastHeikinCandle =
            heikinColor === ohlc[ohlc.length - 1].heikinColor;
          const trueColor =
            item.close > item.open ? CandleColor.GREEN : CandleColor.RED;
          const hasSameTrueColorAsLastCandle =
            trueColor === ohlc[ohlc.length - 1].trueColor;
          const isPriceChangePercentageHigherThanLast =
            priceChangePercentage > ohlc[ohlc.length - 1].priceChangePercentage
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isBoxChangePercentageHigherThanLast =
            boxChangePercentage > ohlc[ohlc.length - 1].boxChangePercentage
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinBoxChangePercentageHigherThanLast =
            heikinBoxChangePercentage >
              ohlc[ohlc.length - 1].heikinBoxChangePercentage &&
            hasSameColorAsLastHeikinCandle
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinHighChangePercentageHigherThanLast =
            heikinHighChangePercentage >
            ohlc[ohlc.length - 1].heikinHighChangePercentage
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinLowChangePercentageHigherThanLast =
            heikinLowChangePercentage >
            ohlc[ohlc.length - 1].heikinLowChangePercentage
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinCloseHigherThanLast =
            currentCandleHeikinClose > ohlc[ohlc.length - 1].heikinClose &&
            hasSameColorAsLastHeikinCandle
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinOpenHigherThanLast =
            currentCandleHeikinOpen > ohlc[ohlc.length - 1].heikinOpen &&
            hasSameColorAsLastHeikinCandle
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinHighHigherThanLast =
            currentCandleHeikinHigh > ohlc[ohlc.length - 1].heikinHigh
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const isHeikinLowHigherThanLast =
            currentCandleHeikinLow > ohlc[ohlc.length - 1].heikinLow
              ? SingleSignal.TRUE_BUY
              : SingleSignal.FALSE_SELL;
          const singleSignalCalculationArray = [
            isPriceChangePercentageHigherThanLast,
            isBoxChangePercentageHigherThanLast,
            isHeikinBoxChangePercentageHigherThanLast,
            isHeikinHighChangePercentageHigherThanLast,
            isHeikinLowChangePercentageHigherThanLast,
            isHeikinCloseHigherThanLast,
            isHeikinOpenHigherThanLast,
            isHeikinHighHigherThanLast,
            isHeikinLowHigherThanLast,
          ];
          const trueSignals = singleSignalCalculationArray.filter(
            (item) => item == SingleSignal.TRUE_BUY
          ).length;
          const falseSignals =
            singleSignalCalculationArray.length - trueSignals;

          ohlc.push({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            boxFat: boxFat,
            boxChangePercentage: boxChangePercentage,
            trueColor,
            hasSameTrueColorAsLastCandle,
            heikinOpen: currentCandleHeikinOpen,
            heikinHigh: currentCandleHeikinHigh,
            heikinLow: currentCandleHeikinLow,
            heikinClose: currentCandleHeikinClose,
            heikinBoxFat,
            heikinBoxChangePercentage,
            heikinHighChangePercentage,
            heikinLowChangePercentage,
            heikinColor,
            hasSameColorAsLastHeikinCandle,
            priceChangePercentage,
            isPriceChangePercentageHigherThanLast,
            isBoxChangePercentageHigherThanLast,
            isHeikinBoxChangePercentageHigherThanLast,
            isHeikinHighChangePercentageHigherThanLast,
            isHeikinLowChangePercentageHigherThanLast,
            isHeikinOpenHigherThanLast,
            isHeikinHighHigherThanLast,
            isHeikinLowHigherThanLast,
            isHeikinCloseHigherThanLast,
            trueSignals_buy: trueSignals,
            falseSignals_sell: falseSignals,
            iSuggest:
              trueSignals > falseSignals
                ? SignalTypeEnum.BUY
                : SignalTypeEnum.SELL,
          });
        }
      });

      ohlc.reverse();

      let trend: TrendTypeEnum;
      let signal: SignalTypeEnum;

      // BUY
      if (
        ohlc[2].heikinColor === "RED" &&
        ohlc[1].heikinColor === "RED" &&
        ohlc[0].heikinColor === "GREEN"
      ) {
        trend = TrendTypeEnum.RED_RED_GREEN;
        signal = SignalTypeEnum.BUY;
      }

      if (
        ohlc[2].heikinColor === "RED" &&
        ohlc[1].heikinColor === "GREEN" &&
        ohlc[0].heikinColor === "GREEN"
      ) {
        trend = TrendTypeEnum.RED_GREEN_GREEN;
        signal = SignalTypeEnum.STRONG_BUY;
      }

      if (
        ohlc[2].heikinColor === "GREEN" &&
        ohlc[1].heikinColor === "GREEN" &&
        ohlc[0].heikinColor === "GREEN"
      ) {
        trend = TrendTypeEnum.GREEN_GREEN_GREEN;
        signal = SignalTypeEnum.BUY_STOCK_ON_UPTREND;
      }

      // SELL
      if (
        ohlc[2].heikinColor === "GREEN" &&
        ohlc[1].heikinColor === "GREEN" &&
        ohlc[0].heikinColor === "RED"
      ) {
        trend = TrendTypeEnum.GREEN_GREEN_RED;
        signal = SignalTypeEnum.SELL;
      }

      if (
        ohlc[2].heikinColor === "GREEN" &&
        ohlc[1].heikinColor === "RED" &&
        ohlc[0].heikinColor === "RED"
      ) {
        trend = TrendTypeEnum.GREEN_RED_RED;
        signal = SignalTypeEnum.STRONG_SELL;
      }

      if (
        ohlc[2].heikinColor === "RED" &&
        ohlc[1].heikinColor === "RED" &&
        ohlc[0].heikinColor === "RED"
      ) {
        trend = TrendTypeEnum.RED_RED_RED;
        signal = SignalTypeEnum.SELL_STOCK_ON_DOWNTREND;
      }

      // NEUTRAL
      if (
        ohlc[2].heikinColor === "RED" &&
        ohlc[1].heikinColor === "GREEN" &&
        ohlc[0].heikinColor === "RED"
      ) {
        trend = TrendTypeEnum.RED_GREEN_RED;
        signal = SignalTypeEnum.NEUTRAL_SELL;
      }

      if (
        ohlc[2].heikinColor === "GREEN" &&
        ohlc[1].heikinColor === "RED" &&
        ohlc[0].heikinColor === "GREEN"
      ) {
        trend = TrendTypeEnum.GREEN_RED_GREEN;
        signal = SignalTypeEnum.NEUTRAL_BUY;
      }

      const result = {
        scrip: myScrip,
        trend: trend,
        signal: signal,
        history: ohlc,
      };
      return result;
    } else {
      console.log(`SKIPPING: ${myScrip}`);
    }
  }

  async getScripBSECode(scrip: string): Promise<any> {
    const url = `https://groww.in/v1/api/search/v1/entity?app=false&entity_type=stocks&page=0&q=${scrip.toLowerCase()}&size=15`;
    let res: any;
    try {
      res = await axios.get(url);
    } catch (error) {
      throw new InternalServerErrorException(
        `getScripBSECode() error ${error}`
      );
    }
    if (!!res.data && !!res.data.content[0].bse_scrip_code) {
      console.log("BSE Scrip Code:", res.data.content[0].bse_scrip_code);
      return res.data.content[0].bse_scrip_code;
    } else {
      return false;
    }
  }

  async getScripDetails(scrip: string, period: PeriodEnum): Promise<any> {
    const interval: number =
      period === PeriodEnum.WEEKLY
        ? 10080
        : period === PeriodEnum.MONTHLY
        ? 43800
        : 1440;

    const exchange: ExchangeEnum =
      scrip[0] === "-" ? ExchangeEnum.BSE : ExchangeEnum.NSE;

    let bseScripCode: any;
    if (exchange === ExchangeEnum.BSE) {
      const bseScrip = scrip.slice(1);
      bseScripCode = await this.getScripBSECode(bseScrip);
    }

    const currentEpochTime = new Date().getTime(); // current epoch time (ms) as 'endTime'
    const startEpochTime = 1577910020000; // January 1, 2020 20:20:20 AM as 'startTime'

    const myScrip =
      scrip[0] === "-" && bseScripCode ? bseScripCode : scrip.toUpperCase();

    // API URL
    const url = `https://groww.in/v1/api/charting_service/v2/chart/exchange/${exchange}/segment/CASH/${myScrip}?endTimeInMillis=${currentEpochTime}&intervalInMinutes=${interval}&startTimeInMillis=${startEpochTime}`;

    let res: any;
    try {
      res = await axios.get(url);
    } catch (error) {
      throw new InternalServerErrorException(
        `getScripDetails() error ${error}`
      );
    }
    return res.data;
  }

  async getHeikinAshiBarsForScripList(
    scripList: string[],
    portfolio: string[],
    period: PeriodEnum
  ): Promise<{
    period: PeriodEnum;
    reponseTime: Date;
    // shortSwingNote: string;
    // longSwingNote: string;
    stocksNotFound: string[];
    result: any;
    stocksYouShouldSell: any[];
  }> {
    let i = 0;
    const response: {
      [trend: string]: {
        signal: SignalTypeEnum;
        stocks: any[];
      };
    } = {
      RED_RED_GREEN: {
        signal: SignalTypeEnum.BUY,
        stocks: [],
      },
      RED_GREEN_GREEN: {
        signal: SignalTypeEnum.STRONG_BUY,
        stocks: [],
      },
      GREEN_GREEN_GREEN: {
        signal: SignalTypeEnum.BUY_STOCK_ON_UPTREND,
        stocks: [],
      },
      GREEN_GREEN_RED: {
        signal: SignalTypeEnum.SELL,
        stocks: [],
      },
      GREEN_RED_RED: {
        signal: SignalTypeEnum.STRONG_SELL,
        stocks: [],
      },
      RED_RED_RED: {
        signal: SignalTypeEnum.SELL_STOCK_ON_DOWNTREND,
        stocks: [],
      },
      RED_GREEN_RED: {
        signal: SignalTypeEnum.NEUTRAL_SELL,
        stocks: [],
      },
      GREEN_RED_GREEN: {
        signal: SignalTypeEnum.NEUTRAL_BUY,
        stocks: [],
      },
    };

    let myScripList = [...new Set(scripList)];
    const stocksNotFound = [];
    const stocksYouShouldSell = [];

    for (i = 0; i < myScripList.length; i++) {
      const scripToFetch = myScripList[i];

      let scripResult;
      try {
        console.log("Fetching:", scripToFetch);
        scripResult = await this.getHeikinAshiBarsForScrip(
          scripToFetch,
          period
        );
      } catch (error) {
        throw new InternalServerErrorException(
          `getHeikinAshiBarsForScripList() error in getHeikinAshiBarsForScripList() ${error}`
        );
      }

      if (!!scripResult && !!scripResult.scrip) {
        const priceChangePercentage =
          scripResult.history[0].priceChangePercentage;
        const heikinHighChangePercentage =
          scripResult.history[0].heikinHighChangePercentage;
        const heikinBoxChangePercentage =
          scripResult.history[0].heikinBoxChangePercentage;
        const heikinLowChangePercentage =
          scripResult.history[0].heikinLowChangePercentage;

        const obj = {
          scrip: `${scripResult.scrip}__${scripResult.history[0].date}`,
          ohlcHigherThanLast: `O:${scripResult.history[0].isHeikinCloseHigherThanLast}__H:${scripResult.history[0].isHeikinOpenHigherThanLast}__L:${scripResult.history[0].isHeikinHighHigherThanLast}__C:${scripResult.history[0].isHeikinLowHigherThanLast}`,
          changeRate: `priceChange:${priceChangePercentage.toFixed(
            2
          )}%__heikinBoxChange:${heikinBoxChangePercentage.toFixed(
            2
          )}%__heikinHighChange:${heikinHighChangePercentage.toFixed(
            2
          )}%__heikinLowChange:${heikinLowChangePercentage.toFixed(2)}%`,
          sumOfChangeRates: (
            priceChangePercentage +
            heikinBoxChangePercentage +
            heikinHighChangePercentage +
            heikinLowChangePercentage
          ).toFixed(2),
          signals: `iSuggest:${scripResult.history[0].iSuggest}__from:__trueSignals_buy:${scripResult.history[0].trueSignals_buy}__falseSignals_sell:${scripResult.history[0].falseSignals_sell}`,
        };

        response[scripResult.trend].stocks.push(obj);

        // If the repsonse is to sell, and scrip is part of portfolio.
        if (
          portfolio.length > 0 &&
          portfolio.includes(scripResult.scrip) &&
          (scripResult.trend === TrendTypeEnum.GREEN_GREEN_RED ||
            scripResult.trend === TrendTypeEnum.GREEN_RED_RED ||
            scripResult.trend === TrendTypeEnum.RED_RED_RED ||
            scripResult.trend === TrendTypeEnum.RED_GREEN_RED)
        ) {
          stocksYouShouldSell.push(obj);
        }
      } else {
        stocksNotFound.push(scripToFetch);
      }
    }

    console.log("-- DONE --");

    return {
      period: period,
      reponseTime: new Date(),
      // shortSwingNote: `BUY & SELL @ 12:00 [Buy only if Week & Month is GREEN!]`,
      // longSwingNote: `BUY : Wednesday & Thursday @ 12:00 || SELL : Monday & Tuesday @ 12:00 [Buy only if last 3-4 Days & Month is GREEN!]`,
      stocksNotFound: stocksNotFound,
      result: response,
      stocksYouShouldSell: stocksYouShouldSell,
    };
  }
}
