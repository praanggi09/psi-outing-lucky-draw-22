"use client";

import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Plus, Trash2, Edit2, Check, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Prize, 
  getPrizes, 
  addPrize, 
  removePrize,
  updatePrize,
  clearPrizes
} from '@/lib/storage';

export default function PrizesPage() {
  const [category, setCategory] = useState<Category>('doorprize');
  const [prizes, setPrizesState] = useState<Prize[]>([]);
  
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPrizes = async () => {
    const data = await getPrizes(category);
    setPrizesState(data);
  };

  useEffect(() => {
    loadPrizes();
  }, [category]);

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (!name.trim() || isNaN(qty) || qty < 1) return;
    
    await addPrize(category, name.trim(), qty);
    setName('');
    setQuantity('1');
    await loadPrizes();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse<{ Name?: string; name?: string; Prize?: string; Quantity?: string; quantity?: string; qty?: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Fallback for CSVs without headers
        if (results.meta.fields && !results.meta.fields.some(f => ['Name', 'name', 'Prize'].includes(f))) {
           Papa.parse<string[]>(file, {
             header: false,
             skipEmptyLines: true,
             complete: async (res) => {
               for (const row of res.data) {
                 const pName = row[0];
                 const pQty = parseInt(row[1] || '1');
                 if (pName && !isNaN(pQty) && pQty > 0) {
                   await addPrize(category, pName, pQty);
                 }
               }
               await loadPrizes();
               setIsUploading(false);
             }
           });
           return;
        }

        for (const row of results.data) {
          const pName = row.Name || row.name || row.Prize || Object.values(row)[0];
          const pQtyStr = row.Quantity || row.quantity || row.qty || Object.values(row)[1];
          const pQty = parseInt(pQtyStr as string);
          
          if (pName && !isNaN(pQty) && pQty > 0) {
            await addPrize(category, pName as string, pQty);
          }
        }
        await loadPrizes();
        setIsUploading(false);
      },
      error: () => {
        alert("Failed to parse CSV file");
        setIsUploading(false);
      }
    });
    e.target.value = '';
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await removePrize(category, itemToDelete);
    setItemToDelete(null);
    await loadPrizes();
  };

  const confirmClearAll = async () => {
    await clearPrizes(category);
    setShowClearConfirm(false);
    await loadPrizes();
  };

  const startEdit = (p: Prize) => {
    setEditingId(p.id);
    setEditQty(p.quantity.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQty('');
  };

  const saveEdit = async (p: Prize) => {
    const qty = parseInt(editQty);
    if (!isNaN(qty) && qty >= 0) {
      await updatePrize(category, { ...p, quantity: qty });
      await loadPrizes();
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Prizes</h1>
        
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
          <TabsTrigger value="grandprize">Grand Prize Pool</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Add New Prize</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPrize} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Prize Name</label>
              <Input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samsung Smart TV"
                required
              />
            </div>
            <div className="w-32 space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Quantity</label>
              <Input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Prize
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h2 className="font-medium">Total Types: {prizes.length}</h2>
          {prizes.length > 0 && (
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
              <TableHead>Prize Name</TableHead>
              <TableHead className="text-center w-32">Quantity</TableHead>
              <TableHead className="text-center w-32">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prizes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No prizes added yet.
                </TableCell>
              </TableRow>
            ) : (
              prizes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-lg">{p.name}</TableCell>
                  <TableCell className="text-center text-lg">
                    {editingId === p.id ? (
                      <Input 
                        type="number" 
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="w-20 mx-auto text-center h-8"
                        min="0"
                      />
                    ) : (
                      p.quantity
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === p.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => saveEdit(p)}
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10 h-8 w-8"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={cancelEdit}
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEdit(p)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-8 w-8"
                            title="Edit Quantity"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setItemToDelete(p.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
            <DialogTitle>Delete Prize</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prize? This action cannot be undone.
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
            <DialogTitle>Clear All Prizes</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL prizes in this category? This action cannot be undone.
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
