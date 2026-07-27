"use client";

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWinners, clearWinners, Winner } from '@/lib/storage';

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const loadWinners = async () => {
    const data = await getWinners();
    // Sort by timestamp descending
    setWinners(data.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportCSV = () => {
    const confirmedWinners = winners.filter(w => w.status === 'Confirmed');
    
    if (confirmedWinners.length === 0) {
      alert("No confirmed winners to export.");
      return;
    }
    
    const csvData = confirmedWinners.map(w => ({
      'Winner Name': w.participantName,
      'Prize': w.prizeName,
      'Category': w.category,
      'Status': w.status,
      'Timestamp': formatDate(w.timestamp)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `winner_history_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmClearHistory = async () => {
    await clearWinners();
    setIsClearDialogOpen(false);
    await loadWinners();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Winner History</h1>
        <div className="flex gap-4">
          <Button 
            onClick={handleExportCSV}
            disabled={winners.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setIsClearDialogOpen(true)}
            disabled={winners.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Winner Name</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No winners recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              winners.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium text-lg">{w.participantName}</TableCell>
                  <TableCell className="font-medium text-lg">{w.prizeName}</TableCell>
                  <TableCell className="capitalize">{w.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      w.status === 'Confirmed' ? 'default' :
                      w.status === 'Redrawn' ? 'destructive' :
                      'secondary'
                    }>
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(w.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Clear Winner History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear ALL winner history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearHistory}>Clear History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
