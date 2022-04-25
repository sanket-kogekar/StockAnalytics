import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { ScripDto, ScripListDto } from "./ScripDto.dto";
import { PeriodEnum } from "./trendType.enum";

@Controller("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  async getScripDetails(@Query("scrip") scrip: string): Promise<any> {
    const myScripDetails = await this.appService.getScripDetails(
      scrip,
      PeriodEnum.WEEKLY
    );
    return myScripDetails;
  }

  @Post("/heikin-ashi/single-scrip")
  async getHeikinAshiBarsForScrip(@Body() scripDto: ScripDto): Promise<any> {
    const heikinAshiResult = await this.appService.getHeikinAshiBarsForScrip(
      scripDto.scrip,
      scripDto.period
    );
    return heikinAshiResult;
  }

  @Post("/heikin-ashi/multi-scrip")
  async getHeikinAshiBarsForScripList(
    @Body() scripListDto: ScripListDto
  ): Promise<any> {
    const heikinAshiResult = await this.appService.getHeikinAshiBarsForScripList(
      scripListDto.scripList,
      scripListDto.portfolio,
      scripListDto.period
    );
    return heikinAshiResult;
  }
}
