// User Prompt 导出
import tablePageMd from './table-page.md';
import formPageMd from './form-page.md';
import dashboardPageMd from './dashboard-page.md';
import autoDetectMd from './auto-detect.md';

export const USER_TABLE_PAGE = tablePageMd;
export const USER_FORM_PAGE = formPageMd;
export const USER_DASHBOARD_PAGE = dashboardPageMd;
export const USER_AUTO_DETECT = autoDetectMd;

import type { PageType } from '../types';

/** 根据页面类型获取对应的 User Prompt */
export function getUserPrompt(pageType: PageType): string {
  switch (pageType) {
    case 'table':
      return USER_TABLE_PAGE;
    case 'form':
      return USER_FORM_PAGE;
    case 'dashboard':
      return USER_DASHBOARD_PAGE;
    case 'auto':
    default:
      return USER_AUTO_DETECT;
  }
}
