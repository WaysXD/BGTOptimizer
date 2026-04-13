/**
 * @typedef {{
 * tokenIn:string; tokenOut:string; amountIn:string; gasInclude?:boolean;
 * feeAmount?:string; chargeFeeBy?:'currency_in'|'currency_out'; isInBps?:boolean; feeReceiver?:string; origin?:string;
 * }} KyberRouteQuery
 *
 * @typedef {{
 * routeSummary: Record<string, unknown>; routerAddress:string; requestId?:string;
 * amountOut:string; amountIn:string; gas?:string; gasUsd?:string; priceImpact?:number;
 * routeText:string; feeAmount?:string; feeTokenAddress?:string;
 * }} NormalizedKyberQuote
 */

export const DEFAULT_KYBER_BASE_URL = "https://aggregator-api.kyberswap.com";
