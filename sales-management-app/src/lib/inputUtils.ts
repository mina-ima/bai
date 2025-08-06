/**
 * 全角英数字を半角英数字に変換し、指定されたモードに応じて他の文字を削除または保持します。
 * @param value 入力値
 * @param mode 'numeric' (数字とハイフンのみ), 'alphanumeric' (英数字のみ), 'text' (全角英数字のみ半角に変換し、他はそのまま)
 * @returns 変換された半角文字列
 */
export function toHalfWidthAlphanumeric(value: string, mode: 'numeric' | 'alphanumeric' | 'text' = 'text'): string {
  if (!value) return '';

  // 全角英数字を半角に変換
  let convertedValue = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  );

  if (mode === 'numeric') {
    // 数字とハイフン以外を削除 (電話番号や郵便番号でハイフンを使う可能性があるため)
    convertedValue = convertedValue.replace(/[^0-9-]/g, '');
  } else if (mode === 'alphanumeric') {
    // 英数字以外を削除
    convertedValue = convertedValue.replace(/[^a-zA-Z0-9]/g, '');
  }
  // 'text' モードの場合は、全角英数字のみ変換し、他の文字はそのまま

  return convertedValue;
}
