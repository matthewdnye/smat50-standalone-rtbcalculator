import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { CalculationResult } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatting';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TYFv.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptrg8zYS_SKggPNwJYtWqZPBQ.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    textAlign: 'center'
  },
  branding: {
    fontSize: 8,
    color: '#666',
    marginBottom: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e40af'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#374151'
  },
  section: {
    marginBottom: 20
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    minHeight: 25,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold'
  },
  tableCell: {
    padding: 5,
    fontSize: 10
  },
  disclaimer: {
    fontSize: 8,
    color: '#666',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb'
  }
});

interface PDFReportProps {
  result: CalculationResult;
}

const PDFReport: React.FC<PDFReportProps> = ({ result }) => {
  const currentYear = new Date().getFullYear();
  const rmdStartAge = result.projections.find(p => p.rmdRequired)?.age || 0;
  const totalRMDTaxes = result.projections.reduce((sum, year) => 
    sum + (year.rmdAmount * (result.taxRate / 100)), 0);
  const conversionTax = result.currentValue * (result.taxRate / 100);
  const potentialSavings = totalRMDTaxes - conversionTax;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.branding}>
          <Text>Powered by the S.M.A.R.T. Strategy™</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.title}>Retirement Tax Bill Analysis</Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Prepared for:</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>
            {result.userInfo.firstName} {result.userInfo.lastName}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Prepared on {new Date().toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text>© {currentYear} All Rights Reserved | Confidential Analysis</Text>
          <Text>Page 1</Text>
        </View>
      </Page>

      {/* Strategy Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.branding}>
          <Text>Powered by the S.M.A.R.T. Strategy™</Text>
        </View>
        <Text style={styles.subtitle}>Your Current Situation</Text>
        <View style={styles.section}>
          <Text style={{ marginBottom: 10 }}>
            Current Retirement Account Value: {formatCurrency(result.currentValue)}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Current Tax Bracket: {result.taxRate}%
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Required Minimum Distribution Start Age: {rmdStartAge}
          </Text>
        </View>

        <Text style={styles.subtitle}>Tax Burden Comparison</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text>Strategy</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Tax Amount</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text>Current Plan (Total RMD Taxes)</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>{formatCurrency(totalRMDTaxes)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text>S.M.A.R.T. Strategy (One-Time Tax)</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>{formatCurrency(conversionTax)}</Text>
            </View>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f0fdf4' }]}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text>Potential Tax Savings</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>{formatCurrency(potentialSavings)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={{ marginBottom: 5 }}>
            IMPORTANT DISCLAIMERS:
          </Text>
          <Text style={{ marginBottom: 3 }}>
            • This analysis is for educational purposes only and should not be considered tax advice.
          </Text>
          <Text style={{ marginBottom: 3 }}>
            • Examples are hypothetical and based on current tax rates and regulations.
          </Text>
          <Text style={{ marginBottom: 3 }}>
            • Individual situations may vary. Consult with qualified tax and financial professionals.
          </Text>
          <Text>
            • Calculations comply with current SECURE Act provisions but may change with future legislation.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>© {currentYear} All Rights Reserved | Confidential Analysis</Text>
          <Text>Page 2</Text>
        </View>
      </Page>

      {/* Detailed Projections */}
      <Page size="A4" style={styles.page}>
        <View style={styles.branding}>
          <Text>Powered by the S.M.A.R.T. Strategy™</Text>
        </View>
        <Text style={styles.subtitle}>Year-by-Year Projections</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Year</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Age</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>RMD Factor</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>RMD Amount</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text>Balance</Text>
            </View>
          </View>
          {result.projections.slice(0, 20).map((year, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{year.year}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{year.age}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{year.rmdFactor.toFixed(1)}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{formatCurrency(year.rmdAmount)}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{formatCurrency(year.remainingBalance)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>© {currentYear} All Rights Reserved | Confidential Analysis</Text>
          <Text>Page 3</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFReport;