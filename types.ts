// This file acts as a proxy to the new modular types directory.
// This maintains backward compatibility for imports pointing to '.../types'
// which might resolve to this file, while allowing the project to use the new
// modular structure in 'src/types/'.
export * from './types/index';
