import React from 'react';
import {
  ThemeSelector,
  LanguageSelector,
  DateTimeSettings
} from '../../components/settings';
import { useSettings } from '../../hooks';

export default function GeneralSettings() {
  const { settings, updateLanguage, updateDateTimeSettings } = useSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <LanguageSelector
        currentLanguage={settings.general.language}
        onLanguageChange={updateLanguage}
      />

      <ThemeSelector />

      <DateTimeSettings
        initialDateFormat={settings.general.dateTime.dateFormat}
        initialTimeFormat={settings.general.dateTime.timeFormat}
        initialTimezone={settings.general.dateTime.timezone}
        onSave={updateDateTimeSettings}
      />
    </div>
  );
}