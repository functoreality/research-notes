import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'site.config.json');

export function loadSiteConfig() {
  const configPath = path.resolve(
    process.env.NOTES_SITE_CONFIG || DEFAULT_CONFIG_PATH
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(`Site config not found: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const requiredFields = ['title', 'description', 'site', 'base'];

  for (const field of requiredFields) {
    if (typeof config[field] !== 'string' || config[field].trim() === '') {
      throw new Error(`Invalid site config field: ${field}`);
    }
  }

  return {
    lang: 'zh-CN',
    siteName: config.title,
    loadingHint: '首次打开需要下载笔记数据，请稍等一会儿。',
    visitorLabel: '这份笔记',
    ...config,
  };
}
