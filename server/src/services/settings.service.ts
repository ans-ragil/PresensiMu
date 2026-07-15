import prisma from '../config/database';

interface SettingKeyValue {
  key: string;
  value: string;
  description?: string;
}

const DEFAULT_SETTINGS: SettingKeyValue[] = [
  { key: 'company_name', value: 'PT PresensiMu Indonesia', description: 'Nama perusahaan' },
  { key: 'company_address', value: '', description: 'Alamat perusahaan' },
  { key: 'company_phone', value: '', description: 'No. telepon perusahaan' },
  { key: 'company_email', value: '', description: 'Email perusahaan' },
  { key: 'work_start', value: '08:00', description: 'Jam masuk kerja' },
  { key: 'work_end', value: '17:00', description: 'Jam pulang kerja' },
  { key: 'tolerance_minutes', value: '30', description: 'Toleransi keterlambatan (menit)' },
  { key: 'smtp_host', value: '', description: 'SMTP host' },
  { key: 'smtp_port', value: '587', description: 'SMTP port' },
  { key: 'smtp_user', value: '', description: 'SMTP username' },
  { key: 'smtp_pass', value: '', description: 'SMTP password' },
  { key: 'smtp_from', value: '', description: 'Email pengirim' },
  { key: 'logo', value: '', description: 'Logo perusahaan (base64)' },
];

export class SettingsService {
  async getAll(): Promise<Record<string, string>> {
    const settings = await prisma.companySetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    // Ensure defaults exist
    for (const def of DEFAULT_SETTINGS) {
      if (!(def.key in map)) {
        map[def.key] = def.value;
      }
    }
    return map;
  }

  async get(key: string): Promise<string | null> {
    const setting = await prisma.companySetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: string, description?: string): Promise<void> {
    await prisma.companySetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description },
    });
  }

  async setMultiple(settings: { key: string; value: string; description?: string }[]): Promise<void> {
    const ops = settings.map((s) =>
      prisma.companySetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, description: s.description },
      })
    );
    await prisma.$transaction(ops);
  }

  async delete(key: string): Promise<void> {
    await prisma.companySetting.delete({ where: { key } });
  }

  async getCompanyProfile() {
    const all = await this.getAll();
    return {
      name: all.company_name || '',
      address: all.company_address || '',
      phone: all.company_phone || '',
      email: all.company_email || '',
    };
  }

  async setCompanyProfile(data: { name?: string; address?: string; phone?: string; email?: string }) {
    const entries: { key: string; value: string; description: string }[] = [];
    if (data.name !== undefined) entries.push({ key: 'company_name', value: data.name, description: 'Nama perusahaan' });
    if (data.address !== undefined) entries.push({ key: 'company_address', value: data.address, description: 'Alamat perusahaan' });
    if (data.phone !== undefined) entries.push({ key: 'company_phone', value: data.phone, description: 'No. telepon perusahaan' });
    if (data.email !== undefined) entries.push({ key: 'company_email', value: data.email, description: 'Email perusahaan' });
    if (entries.length > 0) await this.setMultiple(entries);
  }

  async getWorkTime() {
    const all = await this.getAll();
    return {
      workStart: all.work_start || '08:00',
      workEnd: all.work_end || '17:00',
      toleranceMinutes: parseInt(all.tolerance_minutes || '30'),
    };
  }

  async setWorkTime(data: { workStart?: string; workEnd?: string; toleranceMinutes?: number }) {
    const entries: { key: string; value: string; description: string }[] = [];
    if (data.workStart !== undefined) entries.push({ key: 'work_start', value: data.workStart, description: 'Jam masuk kerja' });
    if (data.workEnd !== undefined) entries.push({ key: 'work_end', value: data.workEnd, description: 'Jam pulang kerja' });
    if (data.toleranceMinutes !== undefined) entries.push({ key: 'tolerance_minutes', value: String(data.toleranceMinutes), description: 'Toleransi keterlambatan (menit)' });
    if (entries.length > 0) await this.setMultiple(entries);
  }

  async getSmtpSettings() {
    const all = await this.getAll();
    return {
      host: all.smtp_host || '',
      port: all.smtp_port || '587',
      user: all.smtp_user || '',
      pass: all.smtp_pass || '',
      from: all.smtp_from || '',
    };
  }

  async setSmtpSettings(data: { host?: string; port?: string; user?: string; pass?: string; from?: string }) {
    const entries: { key: string; value: string; description: string }[] = [];
    if (data.host !== undefined) entries.push({ key: 'smtp_host', value: data.host, description: 'SMTP host' });
    if (data.port !== undefined) entries.push({ key: 'smtp_port', value: data.port, description: 'SMTP port' });
    if (data.user !== undefined) entries.push({ key: 'smtp_user', value: data.user, description: 'SMTP username' });
    if (data.pass !== undefined) entries.push({ key: 'smtp_pass', value: data.pass, description: 'SMTP password' });
    if (data.from !== undefined) entries.push({ key: 'smtp_from', value: data.from, description: 'Email pengirim' });
    if (entries.length > 0) await this.setMultiple(entries);
  }

  async getLogo(): Promise<string> {
    const logo = await this.get('logo');
    return logo || '';
  }

  async setLogo(logoBase64: string): Promise<void> {
    await this.set('logo', logoBase64, 'Logo perusahaan (base64)');
  }
}

export const settingsService = new SettingsService();
