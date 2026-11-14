#!/usr/bin/env node
/**
 * ShubhLink owner-only content manager.
 * Invoked by GitHub Actions workflow_dispatch. Never accepts credentials from the website.
 */
const fs = require('node:fs');
const vm = require('node:vm');

const repoFile = 'data.js';
const source = fs.readFileSync(repoFile, 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context, {filename: repoFile, timeout: 3000});
const data = JSON.parse(JSON.stringify(context.window.SHUBHLINK_DATA));
if (!data || !Array.isArray(data.categories) || !data.wishes) throw new Error('Invalid existing content');
const operation = process.env.ADMIN_OPERATION || '';
const id = (process.env.ADMIN_CATEGORY || '').trim().toLowerCase();
const lang = (process.env.ADMIN_LANGUAGE || 'gu').trim();
const value = (process.env.ADMIN_MESSAGE || '').trim();
const number = Number(process.env.ADMIN_INDEX || 0);
const names = {
  gu: (process.env.ADMIN_GU_NAME || '').trim(),
  hi: (process.env.ADMIN_HI_NAME || '').trim(),
  en: (process.env.ADMIN_EN_NAME || '').trim()
};
const emoji = (process.env.ADMIN_EMOJI || '').trim();
const description = (process.env.ADMIN_DESCRIPTION || '').trim();
const validLanguages = ['gu','hi','en'];
const category = data.categories.find(c => c.id === id);
if (!/^[a-z][a-z0-9-]{1,30}$/.test(id)) throw new Error('Category ID needs 2-31 lowercase letters, numbers or hyphens');
if (!validLanguages.includes(lang)) throw new Error('Invalid language');
const fail = m => { throw new Error(m) };
if (operation === 'add-message' || operation === 'edit-message' || operation === 'delete-message') {
  if (!category || !Array.isArray(data.wishes[lang]?.[id])) fail('Category does not exist');
  const list = data.wishes[lang][id];
  if (operation !== 'delete-message' && (!value || value.length > 1000)) fail('Enter a message up to 1000 characters');
  if (operation === 'add-message') list.push(value);
  else {
    if (!Number.isInteger(number) || number < 1 || number > list.length) fail('Existing message number must be between 1 and ' + list.length);
    if (operation === 'edit-message') list[number - 1] = value;
    else list.splice(number - 1, 1);
  }
} else if (operation === 'add-category') {
  if (category) fail('Category already exists');
  if (data.categories.length >= 30) fail('Maximum 30 categories');
  if (!names.gu || !names.hi || !names.en || !emoji || !description) fail('Provide all three category names, emoji and Gujarati description');
  if (Object.values(names).some(s=>s.length > 60) || description.length > 140 || emoji.length > 16) fail('Category metadata too long');
  data.categories.push({id, emoji, gu:names.gu, hi:names.hi, en:names.en, desc:description, color:'pink'});
  for (const l of validLanguages) data.wishes[l][id] = [];
} else if (operation === 'edit-category') {
  if (!category) fail('Category does not exist');
  for (const l of validLanguages) if (names[l]) category[l] = names[l].slice(0,60);
  if (emoji) category.emoji = emoji.slice(0,16);
  if (description) category.desc = description.slice(0,140);
} else fail('Unknown operation');
const output = '/* Original ShubhLink message collection — updated using owner-only GitHub Actions */\nwindow.SHUBHLINK_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(repoFile, output, 'utf8');
console.log('Admin action applied:', operation, id, lang);
