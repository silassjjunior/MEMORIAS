import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/Navigation'
import TrophyCard from '@/components/TrophyCard'
import { useApp } from '@/contexts/AppContext'
import { formatDate } from '@/utils'
import { 
  Search, 
  Filter, 
  Trophy, 
  Calendar,
  SortAsc,
  SortDesc,
  Grid3X3,
  List
} from 'lucide-react'

const TrophiesPage = () => {
  const { trophies, loading } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('acquired_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Filtrar e ordenar troféus
  const filteredAndSortedTrophies = trophies
    .filter(trophy => {
      // Filtro por termo de busca
      const matchesSearch = !searchTerm || 
        trophy.events?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trophy.serial_number.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por categoria
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'transferable' && trophy.is_transferable) ||
        (filterBy === 'non_transferable' && !trophy.is_transferable) ||
        (filterBy === 'recent' && new Date(trophy.acquired_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'acquired_at':
          aValue = new Date(a.acquired_at)
          bValue = new Date(b.acquired_at)
          break
        case 'event_name':
          aValue = a.events?.name || ''
          bValue = b.events?.name || ''
          break
        case 'event_date':
          aValue = new Date(a.events?.event_date || 0)
          bValue = new Date(b.events?.event_date || 0)
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Estatísticas
  const stats = {
    total: trophies.length,
    transferable: trophies.filter(t => t.is_transferable).length,
    recent: trophies.filter(t => 
      new Date(t.acquired_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  }

  const handleTrophyView = (trophy) => {
    // Implementar visualização detalhada do troféu
    console.log('Ver troféu:', trophy)
  }

  const handleTrophyShare = (trophy) => {
    // Implementar compartilhamento do troféu
    console.log('Compartilhar troféu:', trophy)
  }

  const handleTrophySell = (trophy) => {
    // Implementar venda do troféu
    console.log('Vender troféu:', trophy)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Troféus
          </h1>
          <p className="text-gray-600">
            Gerencie sua coleção de troféus digitais e memórias de eventos.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Troféus</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transferíveis</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.transferable}</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Vendáveis
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recentes (30 dias)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome do evento ou código do troféu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="transferable">Transferíveis</SelectItem>
                    <SelectItem value="non_transferable">Não Transferíveis</SelectItem>
                    <SelectItem value="recent">Recentes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquired_at">Data de Aquisição</SelectItem>
                    <SelectItem value="event_name">Nome do Evento</SelectItem>
                    <SelectItem value="event_date">Data do Evento</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Troféus */}
        {loading.trophies ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredAndSortedTrophies.length > 0 ? (
          <>
            {/* Contador de resultados */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredAndSortedTrophies.length} de {trophies.length} troféus
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedTrophies.map((trophy) => (
                  <TrophyCard
                    key={trophy.id}
                    trophy={trophy}
                    onView={handleTrophyView}
                    onShare={handleTrophyShare}
                    onSell={handleTrophySell}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedTrophies.map((trophy) => (
                  <Card key={trophy.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Troféu miniatura */}
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {trophy.events?.name || 'Evento Sem Nome'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Código: {trophy.serial_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            Adquirido em {formatDate(trophy.acquired_at)}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col space-y-2">
                          {trophy.is_transferable && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Transferível
                            </Badge>
                          )}
                          {trophy.events?.event_date && new Date(trophy.events.event_date) > new Date() && (
                            <Badge variant="secondary">
                              Futuro
                            </Badge>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTrophyView(trophy)}
                          >
                            Ver
                          </Button>
                          {trophy.is_transferable && (
                            <Button 
                              size="sm"
                              onClick={() => handleTrophySell(trophy)}
                            >
                              Vender
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'Nenhum troféu encontrado' : 'Você ainda não possui troféus'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'Tente ajustar os filtros de busca para encontrar seus troféus.'
                  : 'Participe de eventos para começar a colecionar troféus digitais únicos.'
                }
              </p>
              {!searchTerm && filterBy === 'all' && (
                <Button>
                  Explorar Eventos
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default TrophiesPage
