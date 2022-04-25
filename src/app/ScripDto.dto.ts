import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { PeriodEnum } from "./trendType.enum";

export class ScripDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  scrip: string;

  @IsDefined()
  @IsEnum(PeriodEnum)
  period: PeriodEnum;
}

export class ScripListDto {
  @IsDefined()
  @IsNotEmpty()
  scripList: string[];

  @IsOptional()
  portfolio: string[];

  @IsDefined()
  @IsEnum(PeriodEnum)
  period: PeriodEnum;
}
