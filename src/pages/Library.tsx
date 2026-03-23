import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EpubBook } from '@/data/mockEpubData';
import { useBooks } from '@/context/BookContext';

export default function Library() {
  const navigate = useNavigate();
  const { books } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  const specialties = [...new Set(books.map(b => b.specialty))];
  const years = [...new Set(books.map(b => b.publishedYear))].sort((a, b) => b - a);

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpecialty = selectedSpecialty === 'all' || book.specialty === selectedSpecialty;
      const matchesYear = selectedYear === 'all' || book.publishedYear >= parseInt(selectedYear);
      return matchesSearch && matchesSpecialty && matchesYear;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.accessCount - a.accessCount;
        case 'newest': return b.publishedYear - a.publishedYear;
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const handleView = useCallback((book: EpubBook) => {
    if (book.tableOfContents && book.tableOfContents.length > 0) {
      const firstChapter = book.tableOfContents[0];
      navigate(`/reader?book=${book.id}&chapter=${firstChapter.id}`);
    } else {
      navigate(`/research?book=${book.id}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-foreground">Compliance Content Catalog</h1>
            <p className="text-muted-foreground mt-1">
              {books.length} titles across 5 curated compliance collections
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container py-8">
        {/* Filters */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search titles, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024+</SelectItem>
              <SelectItem value="2023">2023+</SelectItem>
              <SelectItem value="2022">2022+</SelectItem>
              <SelectItem value="2020">2020+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredBooks.length} of {books.length} titles
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
            >
              <BookCard
                book={book}
                onView={handleView}
              />
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Books Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); setSelectedYear('all'); }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}