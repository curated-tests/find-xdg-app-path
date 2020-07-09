const { homedir } = require('os');
const fs = require('fs');
const path = require('path');

const mri = require('mri');
const XDGAppPaths = require('xdg-app-paths');

// Returns whether a directory exists
const isDirectory = (path) => {
  try {
    return fs.lstatSync(path).isDirectory();
  } catch (_) {
    // We don't care which kind of error occured, it isn't a directory anyway.
    return false;
  }
};

// Returns in which directory the config should be present
const getGlobalPathConfig = () => {
  const args = mri(process.argv.slice(2), {
    string: ['global-config'],
    alias: {
      'global-config': 'Q',
    },
  });

  const customPath = args['global-config'];
  const vercelDirectories = XDGAppPaths('com.vercel.cli').dataDirs();

  const possibleConfigPaths = [
    ...vercelDirectories, // latest vercel directory
    path.join(homedir(), '.now'), // legacy config in user's home directory
    ...XDGAppPaths('now').dataDirs(), // legacy XDG directory
  ];

  // The customPath flag is the preferred location,
  // followed by the the vercel directory,
  // followed by the now directory.
  // If none of those exist, use the vercel directory.
  return (
    (customPath && path.resolve(customPath)) ||
    possibleConfigPaths.find(configPath => isDirectory(configPath)) ||
    vercelDirectories[0]
  );
};
