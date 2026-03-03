"use client"

import React, { useMemo, useState } from 'react';
import data from '@/data/dashboard_data.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { Building2, ShoppingCart, ListChecks, Layers, TrendingUp, Search } from 'lucide-react';

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#0ea5e9', // sky-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#14b8a6'  // teal-500
];

const aggregateBy = (arr: any[], keyField: string, valField: string, limit = 15) => {
  const map: any = {};
  arr.forEach(item => {
    let k = String(item[keyField] || "Unknown").split(',')[0].substring(0, 25);
    let v = Number(item[valField]) || 0;
    map[k] = (map[k] || 0) + v;
  });
  return Object.entries(map)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
};

const countBy = (arr: any[], keyField: string, limit = 15) => {
  const map: any = {};
  arr.forEach(item => {
    let k = String(item[keyField] || "Unknown").split(',')[0].substring(0, 25);
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
};

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

export default function Dashboard() {
  const outstandingData = useMemo(() => aggregateBy(data.outstanding, 'vendor', 'pending_qty'), []);
  const advData = useMemo(() => aggregateBy(data.adv, 'vendor', 'po_value'), []);
  const poData = useMemo(() => countBy(data.po, 'vendor'), []);
  const prData = useMemo(() => aggregateBy(data.pr, 'requested_by', 'qty'), []);
  const rfqData = useMemo(() => countBy(data.rfq, 'vendor'), []);

  const desiChartData = useMemo(() => data.desi.filter((d: any) => d.product).map((d: any) => ({
    name: String(d.product).substring(0, 25),
    poQty: Number(d.po_qty) || 0,
    revisedQty: Number(d.revised_qty) || 0
  })), []);

  const marvelChartData = useMemo(() => data.marvel.filter((d: any) => d.product).map((d: any) => ({
    name: String(d.product).substring(0, 25),
    poQty: Number(d.po_qty) || 0,
    revisedQty: Number(d.revised_qty) || 0
  })), []);

  // Filter States
  const [outstandingFilter, setOutstandingFilter] = useState("All");
  const [poFilter, setPoFilter] = useState("All");
  const [prFilter, setPrFilter] = useState("All");
  const [rfqFilter, setRfqFilter] = useState("All");

  // Options
  const outstandingVendors = useMemo(() => Array.from(new Set(data.outstanding.map((r: any) => r.vendor))).filter(Boolean).sort(), []);
  const poVendors = useMemo(() => Array.from(new Set(data.po.map((r: any) => r.vendor))).filter(Boolean).sort(), []);
  const prRequesters = useMemo(() => Array.from(new Set(data.pr.map((r: any) => r.requested_by))).filter(Boolean).sort(), []);
  const rfqVendors = useMemo(() => Array.from(new Set(data.rfq.map((r: any) => r.vendor))).filter(Boolean).sort(), []);

  // Filtered Tables
  const filteredOutstanding = useMemo(() => outstandingFilter === "All" ? data.outstanding : data.outstanding.filter((r: any) => r.vendor === outstandingFilter), [outstandingFilter]);
  const filteredPO = useMemo(() => poFilter === "All" ? data.po : data.po.filter((r: any) => r.vendor === poFilter), [poFilter]);
  const filteredPR = useMemo(() => prFilter === "All" ? data.pr : data.pr.filter((r: any) => r.requested_by === prFilter), [prFilter]);
  const filteredRFQ = useMemo(() => rfqFilter === "All" ? data.rfq : data.rfq.filter((r: any) => r.vendor === rfqFilter), [rfqFilter]);


  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl animate-in fade-in zoom-in duration-500">
      <header className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Year End closure</h1>
          <p className="text-muted-foreground text-lg">Cross-vendor procurement intelligence dashboard</p>
        </div>
        <div className="mt-4 sm:mt-0 px-4 py-2 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm font-semibold tracking-wider uppercase text-foreground">Operational Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-muted-foreground">Systems Active</span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="outstanding" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-7 w-full h-auto gap-2 bg-transparent p-0 mb-8">
          <TabsTrigger value="outstanding" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><TrendingUp className="w-4 h-4 mr-2" /> Outstanding</TabsTrigger>
          <TabsTrigger value="adv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><Building2 className="w-4 h-4 mr-2" /> Advance List</TabsTrigger>
          <TabsTrigger value="desi" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><Layers className="w-4 h-4 mr-2" /> Desi Arts</TabsTrigger>
          <TabsTrigger value="marvel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><Layers className="w-4 h-4 mr-2" /> Marvel</TabsTrigger>
          <TabsTrigger value="po" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><ShoppingCart className="w-4 h-4 mr-2" /> PO Preclose</TabsTrigger>
          <TabsTrigger value="pr" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><ListChecks className="w-4 h-4 mr-2" /> PR Preclose</TabsTrigger>
          <TabsTrigger value="rfq" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border p-3 rounded-lg"><Search className="w-4 h-4 mr-2" /> RFQs</TabsTrigger>
        </TabsList>

        {/* 1. OUTSTANDING PO */}
        <TabsContent value="outstanding" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Outstanding PO Overview</CardTitle>
              <CardDescription>Top vendors by total pending item quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outstandingData} margin={{ top: 30, right: 30, left: 20, bottom: 65 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="value" name="Pending Quantity" radius={[4, 4, 0, 0]}>
                      {outstandingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#fff" fontSize={11} formatter={(v: any) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-white">Detailed Data Records</h3>
                <div className="w-full sm:w-[300px]">
                  <Select value={outstandingFilter} onValueChange={setOutstandingFilter}>
                    <SelectTrigger className="bg-secondary/40 border-border">
                      <SelectValue placeholder="Filter by Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Vendors</SelectItem>
                      {outstandingVendors.map((v: any) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border group">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Pending Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOutstanding.map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="font-medium text-white">{row.vendor}</TableCell>
                        <TableCell className="text-muted-foreground">{row.status}</TableCell>
                        <TableCell className="max-w-[300px] truncate" title={row.product}>{row.product}</TableCell>
                        <TableCell className="text-right font-bold text-sky-400">{row.pending_qty}</TableCell>
                      </TableRow>
                    ))}
                    {filteredOutstanding.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. ADVANCE VENDOR LIST */}
        <TabsContent value="adv" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Advance Vendor Distribution</CardTitle>
              <CardDescription>Vendors analyzed by gross PO Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advData} margin={{ top: 20, right: 80, left: 20, bottom: 20 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#888" tick={{ fill: '#888' }} width={150} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="value" name="PO Value" radius={[0, 4, 4, 0]}>
                      {advData.map((entry, index) => (
                        <Cell key={`cell-adv-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" fill="#fff" fontSize={11} formatter={(v: any) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border flex-1 border-t pt-6">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Source Doc</TableHead>
                      <TableHead className="text-right">PO Value</TableHead>
                      <TableHead className="text-right">Advance Value</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.adv.map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="font-medium text-white">{row.vendor}</TableCell>
                        <TableCell className="text-muted-foreground">{row.source_doc}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-400">{formatValue(row.po_value)}</TableCell>
                        <TableCell className="text-right text-amber-400">{formatValue(row.adv_value)}</TableCell>
                        <TableCell>{formatValue(row.arrival)}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={row.remarks}>{formatValue(row.remarks)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DESI ARTS */}
        <TabsContent value="desi" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Desi Arts Schedule</CardTitle>
              <CardDescription>Comparison: Cutting Qty As Per PO vs Revised Qty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={desiChartData} margin={{ top: 30, right: 30, left: 20, bottom: 65 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} />
                    <Bar dataKey="poQty" name="Qty As Per PO" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="poQty" position="top" fill="#fff" fontSize={10} />
                    </Bar>
                    <Bar dataKey="revisedQty" name="Revised Qty" fill="#ec4899" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="revisedQty" position="top" fill="#fff" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Fabric</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">PO Qty</TableHead>
                      <TableHead className="text-right">Revised Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.desi.filter((r: any) => r.product).map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="max-w-[250px] truncate text-muted-foreground" title={row.fabric}>{row.fabric}</TableCell>
                        <TableCell className="font-medium text-white max-w-[250px] truncate" title={row.product}>{row.product}</TableCell>
                        <TableCell className="text-right">{row.po_qty}</TableCell>
                        <TableCell className="text-right font-bold text-pink-400">{row.revised_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MARVEL */}
        <TabsContent value="marvel" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Marvel Schedule</CardTitle>
              <CardDescription>Production and revision status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marvelChartData} margin={{ top: 30, right: 30, left: 20, bottom: 65 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} />
                    <Bar dataKey="poQty" name="Qty As Per PO" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="poQty" position="top" fill="#fff" fontSize={10} />
                    </Bar>
                    <Bar dataKey="revisedQty" name="Revised Qty" fill="#10b981" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="revisedQty" position="top" fill="#fff" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Fabric Name</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">PO Qty</TableHead>
                      <TableHead className="text-right">Revised Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.marvel.filter((r: any) => r.product).map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="max-w-[250px] truncate text-muted-foreground" title={row.fabric}>{row.fabric}</TableCell>
                        <TableCell className="font-medium text-white max-w-[250px] truncate">{row.product}</TableCell>
                        <TableCell className="text-right">{row.po_qty}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-400">{row.revised_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. PO PRECLOSE */}
        <TabsContent value="po" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">PO Preclose Distributions</CardTitle>
              <CardDescription>Volume of Source Documents processed per Vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex justify-center items-center w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={poData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="value" name="Documents Processed" radius={[4, 4, 0, 0]}>
                      {poData.map((entry, index) => (
                        <Cell key={`cell-po-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#fff" fontSize={11} formatter={(v: any) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-white">Document Details</h3>
                <div className="w-full sm:w-[300px]">
                  <Select value={poFilter} onValueChange={setPoFilter}>
                    <SelectTrigger className="bg-secondary/40 border-border">
                      <SelectValue placeholder="Filter by Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Vendors</SelectItem>
                      {poVendors.map((v: any) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Source Document</TableHead>
                      <TableHead>Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPO.map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="font-medium text-amber-400">{row.source}</TableCell>
                        <TableCell className="text-white">{row.vendor}</TableCell>
                      </TableRow>
                    ))}
                    {filteredPO.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. PR PRECLOSE */}
        <TabsContent value="pr" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">PR Preclose Requisitions</CardTitle>
              <CardDescription>Total request quantity grouped by personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 13 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="value" name="Requested Qty" radius={[4, 4, 0, 0]}>
                      {prData.map((entry, index) => (
                        <Cell key={`cell-pr-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#fff" fontSize={11} formatter={(v: any) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-white">Request Records</h3>
                <div className="w-full sm:w-[300px]">
                  <Select value={prFilter} onValueChange={setPrFilter}>
                    <SelectTrigger className="bg-secondary/40 border-border">
                      <SelectValue placeholder="Filter by User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Personnel</SelectItem>
                      {prRequesters.map((v: any) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border flex-1">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Requested By</TableHead>
                      <TableHead>PR #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPR.map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="font-medium text-white whitespace-nowrap">{row.requested_by}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">{row.pr}</TableCell>
                        <TableCell className="max-w-[300px] truncate" title={row.desc}>{row.desc}</TableCell>
                        <TableCell className="text-right font-bold text-violet-400">{row.qty}</TableCell>
                      </TableRow>
                    ))}
                    {filteredPR.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. RFQ PRECLOSE */}
        <TabsContent value="rfq" className="space-y-6">
          <Card className="border-border bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">RFQ Operations</CardTitle>
              <CardDescription>Open quote volumes currently engaged per vendor mapping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex justify-center items-center w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rfqData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip cursor={{ fill: '#333', opacity: 0.4 }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="value" name="RFQs" radius={[4, 4, 0, 0]}>
                      {rfqData.map((entry, index) => (
                        <Cell key={`cell-rfq-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#fff" fontSize={11} formatter={(v: any) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-white">RFQ Vendors</h3>
                <div className="w-full sm:w-[300px]">
                  <Select value={rfqFilter} onValueChange={setRfqFilter}>
                    <SelectTrigger className="bg-secondary/40 border-border">
                      <SelectValue placeholder="Filter by Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Vendors</SelectItem>
                      {rfqVendors.map((v: any) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead>Vendor Target</TableHead>
                      <TableHead>Order Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRFQ.map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-secondary/40">
                        <TableCell className="font-medium text-white">{row.vendor}</TableCell>
                        <TableCell className="text-rose-400">{row.order_ref}</TableCell>
                      </TableRow>
                    ))}
                    {filteredRFQ.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
