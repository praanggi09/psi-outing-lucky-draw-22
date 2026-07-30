"use client";

import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Category, 
  Participant, 
  getParticipants, 
  addParticipants, 
  removeParticipant,
  clearParticipants
} from '@/lib/storage';

export default function ParticipantsPage() {
  const [category, setCategory] = useState<Category>('doorprize');
  const [participants, setParticipantsState] = useState<Participant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadParticipants = async () => {
    const data = await getParticipants(category);
    setParticipantsState(data);
  };

  useEffect(() => {
    loadParticipants();
  }, [category]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse<{ Name: string; name: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Extract names, trying 'Name' or 'name' or just first column if no header match
        let newNames = results.data
          .map(row => row.Name || row.name || Object.values(row)[0])
          .filter(Boolean) as string[];

        // if there's no header and it parsed as empty objects
        if (newNames.length === 0 && results.data.length > 0) {
          // Re-parse without header
          Papa.parse<string[]>(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (res) => {
              newNames = res.data.map(row => row[0]).filter(Boolean);
              await addParticipants(category, newNames);
              await loadParticipants();
              setIsUploading(false);
            }
          });
          return;
        }

        await addParticipants(category, newNames);
        await loadParticipants();
        setIsUploading(false);
      },
      error: () => {
        alert("Failed to parse CSV file");
        setIsUploading(false);
      }
    });
    // Reset file input
    e.target.value = '';
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await removeParticipant(category, itemToDelete);
    setItemToDelete(null);
    await loadParticipants();
  };

  const confirmClearAll = async () => {
    await clearParticipants(category);
    setShowClearConfirm(false);
    await loadParticipants();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileUpload}
          disabled={isUploading}
          ref={fileInputRef}
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="doorprize">Doorprize Pool</TabsTrigger>
          <TabsTrigger value="grandprize">Grand Prize & Special Prize Pool</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h2 className="font-medium">Total: {participants.length}</h2>
          {participants.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear All
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-24 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No participants found. Upload a CSV to get started.
                </TableCell>
              </TableRow>
            ) : (
              participants.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setItemToDelete(p.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this participant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Clear All Participants</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL participants in this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearAll}>Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
