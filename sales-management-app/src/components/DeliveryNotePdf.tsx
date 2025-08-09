import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 仮のデータ型定義
interface CompanyInfo {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  fax: string;
  mail: string; // 追加
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  bankHolder: string; // 追加
  personInCharge: string; // 担当者
  invoiceNumber: string; // 追加
}

interface CustomerInfo {
  code: string;
  postalCode: string;
  address: string;
  name: string;
}

interface DeliveryItem {
  productCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  remarks: string;
}

export interface DeliveryNotePdfProps {
  deliveryNoteNumber: string;
  deliveryDate: string; // YYYY/MM/DD 形式を想定
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  deliveryItems: DeliveryItem[]; // This will now be the items for a single page
  currentPage?: number; // 現在のページ番号
  totalPages?: number; // 総ページ数
  isCopy?: boolean; // 控えかどうかを示すフラグ
}

const BORDER_STYLE = '1px solid #000';

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 10,
    fontFamily: 'NotoSansJP',
  },
  section: {
    flexGrow: 1,
    marginBottom: 0,
    border: BORDER_STYLE,
    padding: 10,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 16,
    textAlign: 'center',
    flexGrow: 1,
    textDecoration: 'underline',
    paddingLeft: 215, // 50px左に移動
  },
  topRightInfo: {
    textAlign: 'right',
    width: 'auto',
    marginTop: -5,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 3,
  },
  customerBlock: {
    width: '45%',
  },
  companyBlock: {
    width: '50%',
    textAlign: 'right',
  },
  text: {
    fontSize: 9,
    marginBottom: 0,
  },
  customerPostalCodeText: {
    fontSize: 10,
    marginBottom: 0,
  },
  customerAddressText: {
    fontSize: 10,
    marginBottom: 8,
  },
  customerNameText: {
    fontSize: 12,
    marginBottom: 0,
  },
  companyNameText: {
    fontSize: 11,
    marginBottom: 0,
  },
  bankDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  bankDetailText: {
    fontSize: 9,
    marginBottom: 0,
    marginLeft: 5,
  },
  closingText: {
    fontSize: 9,
    marginTop: 5,
    textAlign: 'right',
  },
  table: {
    width: 'auto',
    marginBottom: 3,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    backgroundColor: '#f0f0f0',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    borderRightColor: '#000',
    borderRightWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCol: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    borderRightColor: '#000',
    borderRightWidth: 1,
    padding: 3,
    justifyContent: 'center',
  },
  tableCell: {
    fontSize: 8,
    textAlign: 'center',
  },
  totalAmountText: {
    fontSize: 9, // 合計金額の文字サイズを1px大きく
    textAlign: 'center', // 合計金額をセルの中央に
  },
  productCodeCol: { flex: 4.5 },
  quantityCol: { flex: 1 },
  unitCol: { flex: 0.5 },
  unitPriceCol: { flex: 1.2 },
  amountCol: { flex: 1.2 },
  remarksCol: { flex: 1.6, borderRightWidth: 0 },
});

// DeliveryNoteSection を DeliveryNotePdf の内部に統合し、単一のページコンテンツとして扱う
export const DeliveryNoteContent: React.FC<{ data: DeliveryNotePdfProps }> = ({ data }) => {
  const { deliveryNoteNumber, deliveryDate, companyInfo, customerInfo, deliveryItems, currentPage, totalPages, isCopy } = data;
  console.log('DeliveryNoteContent: companyInfo:', JSON.stringify(companyInfo, null, 2));

  const tableHeaders = ['品番', '数量', '単位', '単価', '金額', '備考'];

  // 1ページあたりの表示行数を固定 (API側でチャンクされるため、ここでは常に最大行数を想定)
  const maxRowsPerPage = 10;
  const emptyRowsCount = Math.max(0, maxRowsPerPage - deliveryItems.length);
  const emptyRows = Array(emptyRowsCount).fill(null);

  // 合計金額を計算 (このページのアイテムのみ)
  const totalAmount = deliveryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // テキストの長さに応じてフォントサイズを調整するヘルパー関数
  const getTextStyle = (text: string, baseSize: number, maxLength: number, minSize: number = 6) => {
    if (!text) return { fontSize: baseSize };
    const length = text.length;
    if (length > maxLength) {
      const newSize = Math.max(minSize, baseSize * (maxLength / length));
      return { fontSize: newSize };
    }
    return { fontSize: baseSize };
  };

  return (
    <View style={styles.section}>
      {/* 納品書タイトルと右上の情報 */}
      <View style={styles.topSection}>
        <Text style={styles.mainTitle}>納品書{isCopy ? '(控)' : ''}{currentPage && totalPages ? ` (${currentPage}/${totalPages}ページ)` : ''}</Text>
        <View style={styles.topRightInfo}>
          <Text style={styles.text}>納品書No.: {deliveryNoteNumber}</Text>
          <Text style={styles.text}>{deliveryDate}</Text>
        </View>
      </View>

      {/* 顧客情報と自社情報 */}
      <View style={styles.infoSection}>
                <View style={styles.customerBlock}>
          <Text style={styles.text}>取引先コード: {customerInfo.code}</Text>
          <Text style={styles.customerPostalCodeText}>〒{customerInfo.postalCode}</Text>
          <Text style={styles.customerAddressText}>{customerInfo.address}</Text>
          <Text style={styles.customerNameText}>{customerInfo.name}　御中</Text>
        </View>
        <View style={styles.companyBlock}>
          <Text style={{ fontSize: 12, color: 'black', fontFamily: 'NotoSansJP' }}>Name: {String(companyInfo.name)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>PostalCode: {String(companyInfo.postalCode)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>Address: {String(companyInfo.address)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>Phone: {String(companyInfo.phone)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>FAX: {String(companyInfo.fax)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>Mail: {String(companyInfo.mail)}</Text> {/* 追加 */}
          <View style={styles.bankDetailsRow}>
            <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>BankName: {String(companyInfo.bankName)}</Text>
            <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>BranchName: {String(companyInfo.branchName)}</Text>
            <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>AccountType: {String(companyInfo.accountType)}</Text>
            <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>AccountNumber: {String(companyInfo.accountNumber)}</Text>
            <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>BankHolder: {String(companyInfo.bankHolder)}</Text> {/* 追加 */}
          </View>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>PersonInCharge: {String(companyInfo.personInCharge)}</Text>
          <Text style={{ fontSize: 9, color: 'black', fontFamily: 'NotoSansJP' }}>InvoiceNumber: {String(companyInfo.invoiceNumber)}</Text> {/* 追加 */}
          <Text style={styles.closingText}>下記の通り納品致しましたのでご査収ください</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, styles.productCodeCol]}><Text style={styles.tableCell}>{tableHeaders[0]}</Text></View>
          <View style={[styles.tableColHeader, styles.quantityCol]}><Text style={styles.tableCell}>{tableHeaders[1]}</Text></View>
          <View style={[styles.tableColHeader, styles.unitCol]}><Text style={styles.tableCell}>{tableHeaders[2]}</Text></View>
          <View style={[styles.tableColHeader, styles.unitPriceCol]}><Text style={styles.tableCell}>{tableHeaders[3]}</Text></View>
          <View style={[styles.tableColHeader, styles.amountCol]}><Text style={styles.tableCell}>{tableHeaders[4]}</Text></View>
          <View style={[styles.tableColHeader, styles.remarksCol]}><Text style={styles.tableCell}>{tableHeaders[5]}</Text></View>
        </View>
        {deliveryItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, styles.productCodeCol]}><Text style={[styles.tableCell, getTextStyle(item.productCode, 8, 20)]}>{item.productCode}</Text></View>
            <View style={[styles.tableCol, styles.quantityCol]}><Text style={[styles.tableCell, getTextStyle(String(item.quantity), 8, 7)]}>{item.quantity}</Text></View>
            <View style={[styles.tableCol, styles.unitCol]}><Text style={[styles.tableCell, getTextStyle(item.unit, 8, 5)]}>{item.unit}</Text></View>
            <View style={[styles.tableCol, styles.unitPriceCol]}><Text style={[styles.tableCell, getTextStyle(item.unitPrice.toLocaleString(), 8, 10)]}>{item.unitPrice.toLocaleString()}</Text></View>
            <View style={[styles.tableCol, styles.amountCol]}><Text style={[styles.tableCell, getTextStyle((item.quantity * item.unitPrice).toLocaleString(), 8, 12)]}>{(item.quantity * item.unitPrice).toLocaleString()}</Text></View>
            <View style={[styles.tableCol, styles.remarksCol]}><Text style={[styles.tableCell, getTextStyle(item.remarks, 8, 20)]}>{item.remarks}</Text></View>
          </View>
        ))}
        {emptyRows.map((_, index) => (
          <View key={`empty-${index}`} style={styles.tableRow}>
            <View style={[styles.tableCol, styles.productCodeCol]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.quantityCol]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.unitCol]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.unitPriceCol]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.amountCol]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.remarksCol]}><Text style={styles.tableCell}> </Text></View>
          </View>
        ))}
        {/* 合計行 */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.productCodeCol, { borderBottomWidth: 0, borderRightWidth: 0, padding: 3 }]}><Text style={styles.tableCell}> </Text></View>
          <View style={[styles.tableCol, styles.quantityCol, { borderBottomWidth: 0, borderRightWidth: 0, padding: 3 }]}><Text style={styles.tableCell}> </Text></View>
          <View style={[styles.tableCol, styles.unitCol, { borderBottomWidth: 0, borderRightWidth: 0, padding: 3 }]}><Text style={styles.tableCell}> </Text></View>
          <View style={[styles.tableCol, styles.unitPriceCol, { borderBottomWidth: 0, backgroundColor: '#f0f0f0', padding: 3, borderLeftWidth: 1, borderLeftColor: '#000' }]}><Text style={styles.tableCell}>合　計</Text></View>
          <View style={[styles.tableCol, styles.amountCol, { borderBottomWidth: 0, padding: 3 }]}><Text style={styles.totalAmountText}>{totalAmount.toLocaleString()}</Text></View>
          <View style={[styles.tableCol, styles.remarksCol, { borderBottomWidth: 0, padding: 3 }]}><Text style={styles.tableCell}> </Text></View>
        </View>
      </View>
    </View>
  );
};




