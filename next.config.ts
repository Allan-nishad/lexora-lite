import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true" || process.env.DEPLOY_TARGET === "gh-pages";
const repoName = "lexora-lite";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
