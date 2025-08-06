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
}

const BORDER_STYLE = '1px solid #000';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'NotoSansJP',
  },
  section: {
    marginBottom: 20,
    border: BORDER_STYLE,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftHeader: {
    width: '45%',
  },
  rightHeader: {
    width: '45%',
    textAlign: 'right',
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  table: {
    width: 'auto',
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
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
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCol: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    borderRightColor: '#000',
    borderRightWidth: 1,
    padding: 5,
    justifyContent: 'center',
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
  },
  productCodeCol: { flex: 3 }, // 品番は広めに
  quantityCol: { flex: 1 },
  unitCol: { flex: 1 },
  unitPriceCol: { flex: 1.5 },
  amountCol: { flex: 1.5 },
  remarksCol: { flex: 2, borderRightWidth: 0 }, // 最後の列は右ボーダーなし
});

const DeliveryNoteSection: React.FC<{ data: DeliveryNotePdfProps; type: '控' | '' }> = ({ data, type }) => {
  const { deliveryNoteNumber, deliveryDate, companyInfo, customerInfo, deliveryItems } = data;

  const tableHeaders = ['納品品番', '納品数量', '納品単位', '納品単価', '納品金額', '納品備考'];

  const maxRows = 11;
  const emptyRows = Array(Math.max(0, maxRows - deliveryItems.length)).fill(null);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>納品書{type ? `(${type})` : ''}</Text>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.text}>取引先コード: {customerInfo.code}</Text>
          <Text style={styles.text}>取引先〒: {customerInfo.postalCode}</Text>
          <Text style={styles.text}>取引先住所: {customerInfo.address}</Text>
          <Text style={styles.text}>取引先名: {customerInfo.name}</Text>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.text}>納品書番号: {deliveryNoteNumber}</Text>
          <Text style={styles.text}>納品日: {deliveryDate}</Text>
          <Text style={styles.text}>自社名: {companyInfo.name}</Text>
          <Text style={styles.text}>自社〒: {companyInfo.postalCode}</Text>
          <Text style={styles.text}>自社住所: {companyInfo.address}</Text>
          <Text style={styles.text}>自社電話: {companyInfo.phone}</Text>
          <Text style={styles.text}>自社FAX: {companyInfo.fax}</Text>
          <Text style={styles.text}>自社口座（銀行名）: {companyInfo.bankName}</Text>
          <Text style={styles.text}>自社口座（支店名）: {companyInfo.branchName}</Text>
          <Text style={styles.text}>自社口座（口座種）: {companyInfo.accountType}</Text>
          <Text style={styles.text}>自社口座（口座番号）: {companyInfo.accountNumber}</Text>
          <Text style={styles.text}>自社担当者: {companyInfo.personInCharge}</Text>
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
            <View style={[styles.tableCol, styles.productCodeCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.quantityCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.unitCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.unitPriceCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.amountCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
            <View style={[styles.tableCol, styles.remarksCol, { borderBottomWidth: index === emptyRows.length - 1 ? 0 : 1 }]}><Text style={styles.tableCell}> </Text></View>
          </View>
        ))}
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