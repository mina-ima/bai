import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 仮のデータ型定義
interface CompanyInfo {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  fax: string;
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  personInCharge: string; // 担当者
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
  deliveryItems: DeliveryItem[];
  currentPage?: number; // 現在のページ番号
  totalPages?: number; // 総ページ数
}

const BORDER_STYLE = '1px solid #000';

const styles = StyleSheet.create({
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
    paddingLeft: 280, // さらに140px右にずらす
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
    width: '45%',
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

const DeliveryNoteSection: React.FC<{ data: DeliveryNotePdfProps; type: '控' | '' }> = ({ data, type }) => {
  const { deliveryNoteNumber, deliveryDate, companyInfo, customerInfo, deliveryItems, currentPage, totalPages } = data;

  const tableHeaders = ['品番', '数量', '単位', '単価', '金額', '備考'];

  // 表示する納品アイテムを最大10行に制限
  const displayedItems = deliveryItems.slice(0, 10);
  // 空行を計算して、合計で10行になるように調整
  const emptyRowsCount = Math.max(0, 10 - displayedItems.length);
  const emptyRows = Array(emptyRowsCount).fill(null);

  // 合計金額を計算
  const totalAmount = deliveryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <View style={styles.section}>
      {/* 納品書タイトルと右上の情報 */}
      <View style={styles.topSection}>
        <Text style={styles.mainTitle}>納品書{type ? `(${type})` : ''}{currentPage && totalPages ? ` (${currentPage}/${totalPages}ページ)` : ''}</Text>
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
          <Text style={styles.companyNameText}>{companyInfo.name}</Text>
          <Text style={styles.text}>〒{companyInfo.postalCode}</Text>
          <Text style={styles.text}>{companyInfo.address}</Text>
          <Text style={styles.text}>TEL: {companyInfo.phone}</Text>
          <Text style={styles.text}>FAX: {companyInfo.fax}</Text>
          <View style={styles.bankDetailsRow}>
            <Text style={styles.bankDetailText}>{companyInfo.bankName}</Text>
            <Text style={styles.bankDetailText}>{companyInfo.branchName}</Text>
            <Text style={styles.bankDetailText}>{companyInfo.accountType}</Text>
            <Text style={styles.bankDetailText}>{companyInfo.accountNumber}</Text>
          </View>
          <Text style={styles.text}>担当者: {companyInfo.personInCharge}</Text>
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
        {displayedItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, styles.productCodeCol]}><Text style={styles.tableCell}>{item.productCode}</Text></View>
            <View style={[styles.tableCol, styles.quantityCol]}><Text style={styles.tableCell}>{item.quantity}</Text></View>
            <View style={[styles.tableCol, styles.unitCol]}><Text style={styles.tableCell}>{item.unit}</Text></View>
            <View style={[styles.tableCol, styles.unitPriceCol]}><Text style={styles.tableCell}>{item.unitPrice.toLocaleString()}</Text></View>
            <View style={[styles.tableCol, styles.amountCol]}><Text style={styles.tableCell}>{(item.quantity * item.unitPrice).toLocaleString()}</Text></View>
            <View style={[styles.tableCol, styles.remarksCol]}><Text style={styles.tableCell}>{item.remarks}</Text></View>
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

export const DeliveryNotePdf: React.FC<{ data: DeliveryNotePdfProps }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 上段：納品書(控) */}
      <DeliveryNoteSection data={data} type="控" />
      {/* 下段：納品書 */}
      <DeliveryNoteSection data={data} type="" />
    </Page>
  </Document>
);

export default DeliveryNotePdf;
