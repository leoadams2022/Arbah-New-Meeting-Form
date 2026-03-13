export function generateCheckboxSection(title, options, values) {
  let section = `#### **${title}:**\n\n`;

  options.forEach((option) => {
    const state = values?.[option] || { checked: false, note: "" };
    // If not checked, we skip it entirely (no need to show unchecked items)
    if (!state.checked) return "";

    const mark = state.checked ? "x" : " ";

    const note = state.note ? ` — ${state.note}` : "";

    section += `- [${mark}] ${option}${note}\n`;
  });

  return section + "\n";
}

export function generateMarkdown(formData, options) {
  const today = new Date().toISOString().slice(0, 10);

  let md = "";

  md += `# **الاسم:**\n${formData.name}\n\n`;

  md += `#### **رقم الهاتف:**\n${formData.phone}\n\n`;

  md += generateCheckboxSection(
    "دور العميل في المشروع",
    options.roleOptions,
    formData.roles,
  );

  md += generateCheckboxSection(
    "مجال العمل",
    options.businessFieldOptions,
    formData.businessFields,
  );

  md += `#### **الملاحظات:**\n${formData.notes || ""}\n\n`;

  md += generateCheckboxSection(
    "وضع النشاط",
    options.activityStatusOptions,
    formData.activityStatus,
  );

  md += generateCheckboxSection(
    "هل يوجد محاسب؟",
    options.accountantOptions,
    formData.accountantStatus,
  );

  md += generateCheckboxSection(
    "هل يوجد نظام محاسبي؟",
    options.accountingSystemOptions,
    formData.accountingSystemStatus,
  );

  md += `#### **أسم النظام المحاسبي ان وجد:**\n${
    formData.accountingSystemName || ""
  }\n\n`;

  md += `#### **متوسط الحركات:**\n${formData.transactions || ""}\n\n`;

  md += `#### **عدد الموظفين:**\n${formData.employees || ""}\n\n`;

  md += `#### **المدينة:**\n${formData.city || ""}\n\n`;

  md += generateCheckboxSection(
    "النتيجة",
    options.resultOptions,
    formData.result,
  );

  return {
    markdown: md,
    date: today,
  };
}
