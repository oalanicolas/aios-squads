/**
 * Session Manager
 *
 * Manages PedroValerioMind instances with proper lifecycle and cleanup.
 * Prevents memory leaks by reusing mind instances and cleaning up properly.
 *
 * CRITICAL: This was added during Story 1.10 Phase C testing when memory leak
 * test revealed that creating multiple PedroValerioMind instances causes
 * memory leaks due to unclosed event listeners and retained references.
 *
 * @module utils/session-manager
 * @created 2025-10-19 (Story 1.10 - Phase C)
 */

const { loadMind } = require('./mind-loader');

/**
 * Session Manager - Singleton pattern for mind instance management
 */
class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.sharedMind = null; // Shared mind instance for all sessions
  }

  /**
   * Get or create session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session object with mind instance
   */
  async getSession(sessionId) {
    // Check if session already exists
    if (this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId);
      session.lastAccessed = Date.now();
      return session;
    }

    // Create new session using SHARED mind instance
    // This prevents memory leaks by reusing the same mind
    if (!this.sharedMind) {
      this.sharedMind = await loadMind();
    }

    const session = {
      sessionId,
      mind: this.sharedMind, // All sessions share the same mind
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      requestCount: 0
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * End a session and cleanup
   * @param {string} sessionId - Session identifier
   */
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Don't destroy shared mind, just remove session reference
      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Cleanup stale sessions (>8 hours old)
   */
  cleanupStaleSessions() {
    const now = Date.now();
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.lastAccessed > EIGHT_HOURS) {
        this.endSession(sessionId);
      }
    }
  }

  /**
   * Get session count
   * @returns {number} Number of active sessions
   */
  getSessionCount() {
    return this.activeSessions.size;
  }

  /**
   * Destroy all sessions and shared mind (for testing)
   */
  destroyAll() {
    this.activeSessions.clear();

    // Cleanup shared mind if it exists
    if (this.sharedMind && this.sharedMind.cache) {
      this.sharedMind.cache.artifacts.clear();
      this.sharedMind.cache.compiledHeuristics.clear();
    }

    this.sharedMind = null;
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory usage info
   */
  getMemoryStats() {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      activeSessions: this.activeSessions.size,
      sharedMindLoaded: !!this.sharedMind
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Get SessionManager singleton
 * @returns {SessionManager} SessionManager instance
 */
function getSessionManager() {
  if (!instance) {
    instance = new SessionManager();
  }
  return instance;
}

/**
 * Reset SessionManager (for testing)
 */
function resetSessionManager() {
  if (instance) {
    instance.destroyAll();
  }
  instance = null;
}

module.exports = {
  SessionManager,
  getSessionManager,
  resetSessionManager
};
