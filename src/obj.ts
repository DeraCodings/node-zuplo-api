const obj = {
  contextId: "8b8a9716-c146-4063-94a2-bb809f74dd83",
  requestId: "a1bc8048-0ab6-4423-9115-1706991f4056",
  log: {},
  route: {
    path: "/api/products",
    pathPattern: "/api/products{/}?",
    metadata: { filepath: "./config/routes.oas.json" },
    methods: ["GET"],
    handler: { export: "default", module: {}, options: {} },
    corsPolicy: "none",
    policies: { inbound: ["custom-code-inbound"] },
  },
  custom: {},
  incomingRequestProperties: {
    asn: 13335,
    asOrganization: "Cloudflare, Inc.",
    city: "London",
    continent: "EU",
    country: "GB",
    latitude: "51.50853",
    longitude: "-0.12574",
    colo: "LHR",
    postalCode: "E1W",
    region: "England",
    regionCode: "ENG",
    timezone: "Europe/London",
    httpProtocol: "HTTP/1.1",
  },
  analyticsContext: {},
};

// ERROR: Could not find any export due to a compile error in 'modules/route-by-region.ts'
//     | File: ./config/routes.oas.json:0:0
// Build failed.

// When you see the above error, it means that there was a compile error in the specified file (in this case, 'modules/route-by-region.ts') which caused the build process to fail. The error message indicates that the build system could not find any export from that file due to the compile error. To resolve this issue, you would need to check the 'modules/route-by-region.ts' file for any syntax errors, type errors, or other issues that could be causing the compile error and fix them accordingly. Once the errors in that file are resolved, you should be able to successfully build your project without encountering this error message.