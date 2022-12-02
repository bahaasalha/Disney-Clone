const { whenDev } = require("@craco/craco");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = async function ({ env }) {
  return {
    webpack: {
      plugins: [
        ...whenDev(
          () => [
            new CircularDependencyPlugin({
              // exclude detection of files based on a RegExp
              exclude: /a\.js|node_modules/,
              // add errors to webpack instead of warnings
              failOnError: true,
              // set the current working directory for displaying module paths
              cwd: process.cwd(),
              // `onStart` is called before the cycle detection starts
              onStart({ compilation }) {
                console.log("start detecting webpack modules cycles");
              },
              // `onDetected` is called for each module that is cyclical
              onDetected({ module: webpackModuleRecord, paths, compilation }) {
                // `paths` will be an Array of the relative module paths that make up the cycle
                // `module` will be the module record generated by webpack that caused the cycle
                compilation.errors.push(new Error(paths.join(" -> ")));
              },
              // `onEnd` is called before the cycle detection ends
              onEnd({ compilation }) {
                console.log("end detecting webpack modules cycles");
              },
            }),
            new BundleAnalyzerPlugin({
              analyzerPort: process.env.BUNDLE_ANALYZER_PORT || 8889,
            }),
          ],
          []
        ),
      ],
    },
  };
};