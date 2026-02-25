export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  blockchain: {
    providerApiKey: process.env.PROVIDER_API_KEY,
    rpcUrl: process.env.RPC_URL! + process.env.PROVIDER_API_KEY!,
    usdcAddress: process.env.USDC_ADDRESS!,
    usdcABI: process.env.USDC_ABI!
  }
});
