import { ref } from 'vue';

interface VersionInfo {
  version: string;
  timestamp: number;
}

const VERSION_KEY = 'outdoor-gear-app-version';
const VERSION_DISMISSED_KEY = 'outdoor-gear-version-dismissed';

/**
 * 版本检测 Composable
 */
export function useVersionChecker() {
  const currentVersion = ref<string>('');
  const previousVersion = ref<string>('');
  const isNewVersion = ref<boolean>(false);

  /**
   * 获取当前应用版本（从 package.json 注入）
   */
  function getCurrentVersion(): string {
    // 使用 Vite 注入的版本号（从 package.json）
    return __APP_VERSION__;
  }

  /**
   * 获取存储的版本信息
   */
  function getStoredVersion(): VersionInfo | null {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('解析版本信息失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 保存版本信息
   */
  function saveVersion(version: string): void {
    const versionInfo: VersionInfo = {
      version,
      timestamp: Date.now(),
    };
    localStorage.setItem(VERSION_KEY, JSON.stringify(versionInfo));
  }

  /**
   * 检查版本是否已被忽略
   */
  function isVersionDismissed(version: string): boolean {
    const dismissed = localStorage.getItem(VERSION_DISMISSED_KEY);
    return dismissed === version;
  }

  /**
   * 标记版本提示已忽略
   */
  function dismissVersion(version: string): void {
    localStorage.setItem(VERSION_DISMISSED_KEY, version);
  }

  /**
   * 清除版本忽略标记
   */
  function clearDismissed(): void {
    localStorage.removeItem(VERSION_DISMISSED_KEY);
  }

  /**
   * 比较版本号
   * @returns 如果 v1 > v2 返回 true
   */
  function isNewerVersion(v1: string, v2: string): boolean {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return true;
      if (num1 < num2) return false;
    }

    return false;
  }

  /**
   * 检查版本更新
   */
  function checkVersion(): boolean {
    currentVersion.value = getCurrentVersion();
    const storedInfo = getStoredVersion();
    const dismissedVersion = localStorage.getItem(VERSION_DISMISSED_KEY);

    console.log('🔍 版本检查详情:', {
      currentVersion: currentVersion.value,
      storedVersion: storedInfo?.version || '无',
      dismissedVersion: dismissedVersion || '无',
      isNewer: storedInfo ? isNewerVersion(currentVersion.value, storedInfo.version) : false,
      isDismissed: isVersionDismissed(currentVersion.value)
    });

    if (storedInfo) {
      previousVersion.value = storedInfo.version;

      // 如果版本号不同且当前版本更新
      if (
        currentVersion.value !== storedInfo.version &&
        isNewerVersion(currentVersion.value, storedInfo.version)
      ) {
        // 检查是否已经忽略过这个版本
        if (!isVersionDismissed(currentVersion.value)) {
          isNewVersion.value = true;
          console.log(
            `🎉 检测到版本更新: ${storedInfo.version} → ${currentVersion.value}`
          );
          return true;
        } else {
          // 版本已被忽略，但仍需要更新存储的版本信息
          console.log(`⏭️ 版本 ${currentVersion.value} 已被忽略，跳过提示`);
          saveVersion(currentVersion.value);
        }
      } else {
        // 版本相同或当前版本不是更新版本，更新存储信息
        console.log(`📝 版本相同或非更新版本，更新存储信息`);
        saveVersion(currentVersion.value);
      }
    } else {
      // 首次访问，保存当前版本
      console.log(`📦 首次访问，当前版本: ${currentVersion.value}`);
      saveVersion(currentVersion.value);
    }

    return false;
  }

  /**
   * 确认已查看更新
   */
  function confirmUpdate(): void {
    saveVersion(currentVersion.value);
    clearDismissed();
    isNewVersion.value = false;
    console.log(`✅ 用户已确认版本更新: ${currentVersion.value}`);
  }

  /**
   * 稍后提醒（本次会话不再提示，下次访问再提示）
   */
  function remindLater(): void {
    dismissVersion(currentVersion.value);
    isNewVersion.value = false;
    console.log(`⏭️ 用户选择稍后查看版本更新: ${currentVersion.value}`);
  }

  return {
    currentVersion,
    previousVersion,
    isNewVersion,
    checkVersion,
    confirmUpdate,
    remindLater,
  };
}

