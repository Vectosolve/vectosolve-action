import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";

const API_URL = "https://vectosolve.com/api/v1/vectorize";

async function run(): Promise<void> {
  const startTime = Date.now();

  try {
    const apiKey = core.getInput("api_key", { required: true });
    const filePath = core.getInput("file_path", { required: true });
    let outputPath = core.getInput("output_path");

    // Resolve file path
    const resolvedInput = path.resolve(filePath);

    if (!fs.existsSync(resolvedInput)) {
      throw new Error(`File not found: ${resolvedInput}`);
    }

    // Default output path: same name with .svg extension
    if (!outputPath) {
      const parsed = path.parse(resolvedInput);
      outputPath = path.join(parsed.dir, `${parsed.name}.svg`);
    } else {
      outputPath = path.resolve(outputPath);
    }

    core.info(`Converting: ${resolvedInput}`);
    core.info(`Output: ${outputPath}`);

    // Read the file and build FormData
    const fileBuffer = fs.readFileSync(resolvedInput);
    const fileName = path.basename(resolvedInput);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append("file", blob, fileName);

    // Call VectoSolve API
    core.info("Uploading to VectoSolve API...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error || errorJson.message || errorBody;
      } catch {
        errorMessage = errorBody;
      }

      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Get your key at https://vectosolve.com/dashboard"
        );
      }
      if (response.status === 402) {
        throw new Error(
          "Insufficient credits. Purchase more at https://vectosolve.com/pricing"
        );
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      throw new Error(
        `API request failed (${response.status}): ${errorMessage}`
      );
    }

    const result = await response.json();

    if (!result.svg && !result.url) {
      throw new Error("No SVG data received from API");
    }

    // Save the SVG output
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (result.svg) {
      // SVG content returned directly
      fs.writeFileSync(outputPath, result.svg, "utf-8");
    } else if (result.url) {
      // SVG available at URL — download it
      const svgResponse = await fetch(result.url);
      if (!svgResponse.ok) {
        throw new Error(`Failed to download SVG from ${result.url}`);
      }
      const svgContent = await svgResponse.text();
      fs.writeFileSync(outputPath, svgContent, "utf-8");
    }

    const processingTime = Date.now() - startTime;

    core.info(`SVG saved to ${outputPath}`);
    core.info(`Processing time: ${processingTime}ms`);

    // Set outputs
    core.setOutput("svg_path", outputPath);
    core.setOutput("processing_time_ms", processingTime.toString());
    core.setOutput("credits_used", result.credits_used?.toString() || "1");
    core.setOutput(
      "credits_remaining",
      result.credits_remaining?.toString() || ""
    );
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
