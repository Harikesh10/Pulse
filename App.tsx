import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Home,
  Menu,
  Search,
  Share2,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories, publishers } from './src/data/news';
import { getLatestNews } from './src/services/newsService';
import { Article, Tab } from './src/types';

const colors = {
  black: '#08090A',
  panel: '#111315',
  panelLight: '#191C1F',
  border: '#292C30',
  red: '#EF233C',
  redDark: '#8D0D1D',
  white: '#F8F8F8',
  gray: '#A5A8AD',
  dim: '#686C72',
};

const SAVED_KEY = 'pulse-tech:saved-articles';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [category, setCategory] = useState('Top stories');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    const latest = await getLatestNews();
    setArticles(latest);
    refresh ? setRefreshing(false) : setLoading(false);
  };

  useEffect(() => {
    loadNews();
    AsyncStorage.getItem(SAVED_KEY).then((value) => {
      if (value) setSavedIds(JSON.parse(value));
    });
  }, []);

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = articles;
    if (activeTab === 'Saved') result = result.filter((item) => savedIds.includes(item.id));
    if (category !== 'Top stories') result = result.filter((item) => item.category === category);
    if (query.trim()) {
      const term = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.publisher.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term),
      );
    }
    return result;
  }, [activeTab, articles, category, query, savedIds]);

  const featured = articles.find((article) => article.featured) ?? articles[0];

  const renderMainContent = () => {
    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.red} size="large" />
          <Text style={styles.loadingText}>Gathering the latest signals...</Text>
        </View>
      );
    }

    if (activeTab === 'Profile') return <ProfileView savedCount={savedIds.length} />;

    return (
      <>
        {activeTab === 'Home' && !query && featured ? (
          <FeaturedCard article={featured} onPress={setSelectedArticle} />
        ) : null}

        {activeTab === 'Discover' && !query ? (
          <PublisherStrip
            onSelect={(name) => {
              setCategory('Top stories');
              setQuery(name);
              setSearchOpen(true);
            }}
          />
        ) : null}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.eyebrow}>
              {query ? 'SEARCH RESULTS' : activeTab === 'Saved' ? 'YOUR LIBRARY' : 'LIVE FEED'}
            </Text>
            <Text style={styles.sectionTitle}>
              {query ? `News for “${query}”` : activeTab === 'Saved' ? 'Saved stories' : 'Latest stories'}
            </Text>
          </View>
          <Text style={styles.resultCount}>{filtered.length}</Text>
        </View>

        {filtered.length ? (
          filtered.map((article, index) => (
            <View key={article.id}>
              <ArticleCard
                article={article}
                saved={savedIds.includes(article.id)}
                onPress={setSelectedArticle}
                onSave={toggleSaved}
              />
              {index === 1 && activeTab !== 'Saved' ? <SponsoredCard /> : null}
            </View>
          ))
        ) : (
          <EmptyState saved={activeTab === 'Saved'} />
        )}
      </>
    );
  };

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <View style={styles.logoSlash} />
              <View style={[styles.logoSlash, styles.logoSlashTwo]} />
            </View>
            <View>
              <Text style={styles.brand}>PULSE</Text>
              <Text style={styles.brandSub}>GLOBAL TECH NEWS</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSearchOpen((open) => !open)}>
              {searchOpen ? <X color={colors.white} size={20} /> : <Search color={colors.white} size={20} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} onPress={() => setActiveTab('Profile')}>
              <Text style={styles.avatarText}>HK</Text>
            </TouchableOpacity>
          </View>
        </View>
        {searchOpen ? (
          <View style={styles.searchBox}>
            <Search color={colors.dim} size={18} />
            <TextInput
              autoFocus
              onChangeText={setQuery}
              placeholder="Search AI, startups, gadgets..."
              placeholderTextColor={colors.dim}
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X color={colors.gray} size={18} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.breakingBar}>
        <View style={styles.liveDot} />
        <Text style={styles.breakingLabel}>LIVE</Text>
        <Text numberOfLines={1} style={styles.breakingText}>
          Tracking AI, startups, science and the future of technology
        </Text>
        <ChevronRight color={colors.gray} size={16} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNews(true)} tintColor={colors.red} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== 'Profile' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryPill, category === item && styles.categoryPillActive]}
              >
                <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        {renderMainContent()}
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <NavItem icon={Home} label="Home" active={activeTab === 'Home'} onPress={() => setActiveTab('Home')} />
        <NavItem
          icon={Compass}
          label="Discover"
          active={activeTab === 'Discover'}
          onPress={() => setActiveTab('Discover')}
        />
        <NavItem
          icon={Bookmark}
          label="Saved"
          active={activeTab === 'Saved'}
          onPress={() => setActiveTab('Saved')}
        />
        <NavItem
          icon={UserRound}
          label="Profile"
          active={activeTab === 'Profile'}
          onPress={() => setActiveTab('Profile')}
        />
      </View>

      <ArticleModal
        article={selectedArticle}
        saved={selectedArticle ? savedIds.includes(selectedArticle.id) : false}
        onClose={() => setSelectedArticle(null)}
        onSave={toggleSaved}
      />
    </View>
  );
}

function FeaturedCard({ article, onPress }: { article: Article; onPress: (article: Article) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(article)} style={styles.featured}>
      <Image source={{ uri: article.imageUrl }} style={styles.featuredImage} />
      <LinearGradient colors={['transparent', 'rgba(8,9,10,0.65)', colors.black]} style={StyleSheet.absoluteFill} />
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadge}>
          <Sparkles color={colors.white} size={12} />
          <Text style={styles.featuredBadgeText}>EDITOR'S PICK</Text>
        </View>
        <Text style={styles.featuredTitle}>{article.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.publisherRed}>{article.publisher}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{article.timeAgo}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{article.readTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ArticleCard({
  article,
  saved,
  onPress,
  onSave,
}: {
  article: Article;
  saved: boolean;
  onPress: (article: Article) => void;
  onSave: (id: string) => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={() => onPress(article)} style={styles.articleCard}>
      <View style={styles.articleText}>
        <View style={styles.articleTopline}>
          <Text style={styles.publisher}>{article.publisher.toUpperCase()}</Text>
          <Text style={styles.categoryLabel}>{article.category}</Text>
        </View>
        <Text numberOfLines={3} style={styles.articleTitle}>
          {article.title}
        </Text>
        <View style={styles.articleFooter}>
          <Clock3 color={colors.dim} size={13} />
          <Text style={styles.metaText}>{article.timeAgo}</Text>
          <Text style={styles.metaText}>·</Text>
          <Text style={styles.metaText}>{article.readTime}</Text>
          <TouchableOpacity
            hitSlop={12}
            onPress={(event) => {
              event.stopPropagation();
              onSave(article.id);
            }}
            style={styles.saveButton}
          >
            <Bookmark color={saved ? colors.red : colors.gray} fill={saved ? colors.red : 'transparent'} size={18} />
          </TouchableOpacity>
        </View>
      </View>
      <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
    </TouchableOpacity>
  );
}

function SponsoredCard() {
  return (
    <View style={styles.sponsored}>
      <LinearGradient colors={['#2B0A10', '#151719']} end={{ x: 1, y: 0 }} style={styles.sponsoredGradient}>
        <View style={styles.sponsoredCopy}>
          <Text style={styles.sponsoredLabel}>SPONSORED · PULSE PARTNER</Text>
          <Text style={styles.sponsoredTitle}>Build faster. Ship smarter.</Text>
          <Text style={styles.sponsoredText}>Discover tools selected for modern product teams.</Text>
        </View>
        <View style={styles.sponsoredArrow}>
          <ChevronRight color={colors.white} size={20} />
        </View>
      </LinearGradient>
    </View>
  );
}

function PublisherStrip({ onSelect }: { onSelect: (publisher: string) => void }) {
  return (
    <View style={styles.publishersBlock}>
      <Text style={styles.eyebrow}>TRUSTED SOURCES</Text>
      <Text style={styles.sectionTitle}>Explore publishers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.publisherScroll}>
        {publishers.map((publisher) => (
          <TouchableOpacity key={publisher.name} onPress={() => onSelect(publisher.name)} style={styles.publisherCard}>
            <Text style={styles.publisherMonogram}>{publisher.monogram}</Text>
            <Text style={styles.publisherName}>{publisher.name}</Text>
            <Text style={styles.publisherFocus}>{publisher.focus}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function ProfileView({ savedCount }: { savedCount: number }) {
  return (
    <View style={styles.profile}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>HK</Text>
      </View>
      <Text style={styles.profileTitle}>Your daily tech pulse</Text>
      <Text style={styles.profileSubtitle}>A concise global feed shaped around the topics and publishers you follow.</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{savedCount}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Sources</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Topics</Text>
        </View>
      </View>
      <View style={styles.settingsCard}>
        {['Manage interests', 'Publisher preferences', 'Notification schedule'].map((item) => (
          <TouchableOpacity key={item} style={styles.settingRow}>
            <Text style={styles.settingText}>{item}</Text>
            <ChevronRight color={colors.dim} size={18} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EmptyState({ saved }: { saved: boolean }) {
  return (
    <View style={styles.empty}>
      <Bookmark color={colors.dim} size={30} />
      <Text style={styles.emptyTitle}>{saved ? 'Nothing saved yet' : 'No stories found'}</Text>
      <Text style={styles.emptyText}>
        {saved ? 'Tap the bookmark on any story to keep it here.' : 'Try another category or search term.'}
      </Text>
    </View>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onPress,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem}>
      <Icon color={active ? colors.red : colors.dim} fill={active && label === 'Saved' ? colors.red : 'transparent'} size={21} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      {active ? <View style={styles.navIndicator} /> : null}
    </TouchableOpacity>
  );
}

function ArticleModal({
  article,
  saved,
  onClose,
  onSave,
}: {
  article: Article | null;
  saved: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
}) {
  if (!article) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <SafeAreaView style={styles.modal}>
        <StatusBar style="light" />
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalIconButton}>
            <ChevronLeft color={colors.white} size={22} />
          </TouchableOpacity>
          <Text style={styles.modalPublisher}>{article.publisher.toUpperCase()}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => Share.share({ message: `${article.title}\n${article.url}` })} style={styles.modalIconButton}>
              <Share2 color={colors.white} size={19} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(article.id)} style={styles.modalIconButton}>
              <Bookmark color={saved ? colors.red : colors.white} fill={saved ? colors.red : 'transparent'} size={19} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: article.imageUrl }} style={styles.modalImage} />
          <View style={styles.modalContent}>
            <Text style={styles.modalCategory}>{article.category.toUpperCase()}</Text>
            <Text style={styles.modalTitle}>{article.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.publisherRed}>{article.publisher}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{article.timeAgo}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{article.readTime}</Text>
            </View>
            <View style={styles.rule} />
            <Text style={styles.summary}>{article.summary}</Text>
            <Text style={styles.bodyText}>
              PULSE brings together reporting from respected technology publishers in one focused reading experience. Open the
              original report to read the complete story and support the publisher.
            </Text>
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(article.url)} style={styles.readButton}>
              <Text style={styles.readButtonText}>Read full story</Text>
              <ChevronRight color={colors.white} size={18} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { backgroundColor: colors.black, flex: 1 },
  header: { backgroundColor: colors.black, paddingBottom: 12, paddingHorizontal: 18 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  logoMark: { height: 30, overflow: 'hidden', position: 'relative', width: 30 },
  logoSlash: { backgroundColor: colors.red, height: 34, left: 6, position: 'absolute', top: -2, transform: [{ rotate: '24deg' }], width: 6 },
  logoSlashTwo: { left: 17 },
  brand: { color: colors.white, fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  brandSub: { color: colors.dim, fontSize: 7, fontWeight: '700', letterSpacing: 1.6, marginTop: 1 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  iconButton: { alignItems: 'center', backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  avatar: { alignItems: 'center', backgroundColor: colors.red, borderRadius: 18, height: 38, justifyContent: 'center', width: 38 },
  avatarText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  searchBox: { alignItems: 'center', backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 9, marginTop: 13, paddingHorizontal: 12 },
  searchInput: { color: colors.white, flex: 1, fontSize: 14, paddingVertical: 11 },
  breakingBar: { alignItems: 'center', backgroundColor: colors.panelLight, borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 18, paddingVertical: 9 },
  liveDot: { backgroundColor: colors.red, borderRadius: 4, height: 7, width: 7 },
  breakingLabel: { color: colors.red, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  breakingText: { color: colors.gray, flex: 1, fontSize: 10 },
  content: { paddingHorizontal: 16, paddingTop: 15 },
  categoryScroll: { marginHorizontal: -16, marginBottom: 16, paddingLeft: 16 },
  categoryPill: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginRight: 8, paddingHorizontal: 15, paddingVertical: 9 },
  categoryPillActive: { backgroundColor: colors.red, borderColor: colors.red },
  categoryText: { color: colors.gray, fontSize: 11, fontWeight: '700' },
  categoryTextActive: { color: colors.white },
  featured: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 360, marginBottom: 25, overflow: 'hidden' },
  featuredImage: { height: '100%', width: '100%' },
  featuredContent: { bottom: 0, left: 0, padding: 20, position: 'absolute', right: 0 },
  featuredBadge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.red, borderRadius: 4, flexDirection: 'row', gap: 5, marginBottom: 11, paddingHorizontal: 8, paddingVertical: 5 },
  featuredBadgeText: { color: colors.white, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  featuredTitle: { color: colors.white, fontSize: 25, fontWeight: '900', letterSpacing: -0.7, lineHeight: 29, marginBottom: 12 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  publisherRed: { color: colors.red, fontSize: 10, fontWeight: '900' },
  metaDot: { backgroundColor: colors.dim, borderRadius: 2, height: 3, width: 3 },
  metaText: { color: colors.dim, fontSize: 10, fontWeight: '600' },
  sectionHeading: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { color: colors.red, fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginBottom: 4 },
  sectionTitle: { color: colors.white, fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  resultCount: { color: colors.dim, fontSize: 11, fontWeight: '700' },
  articleCard: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 13, paddingVertical: 16 },
  articleText: { flex: 1 },
  articleTopline: { alignItems: 'center', flexDirection: 'row', gap: 7, marginBottom: 7 },
  publisher: { color: colors.red, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  categoryLabel: { color: colors.dim, fontSize: 9, fontWeight: '700' },
  articleTitle: { color: colors.white, fontSize: 15, fontWeight: '800', lineHeight: 20 },
  articleFooter: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 12 },
  saveButton: { marginLeft: 'auto' },
  articleImage: { backgroundColor: colors.panel, borderRadius: 10, height: 104, width: 104 },
  sponsored: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 16 },
  sponsoredGradient: { alignItems: 'center', borderColor: '#48111B', borderRadius: 12, borderWidth: 1, flexDirection: 'row', padding: 15 },
  sponsoredCopy: { flex: 1 },
  sponsoredLabel: { color: colors.red, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  sponsoredTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginTop: 5 },
  sponsoredText: { color: colors.gray, fontSize: 10, marginTop: 3 },
  sponsoredArrow: { alignItems: 'center', backgroundColor: colors.red, borderRadius: 20, height: 36, justifyContent: 'center', width: 36 },
  publishersBlock: { marginBottom: 25 },
  publisherScroll: { marginHorizontal: -16, marginTop: 13, paddingLeft: 16 },
  publisherCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginRight: 10, minHeight: 125, padding: 14, width: 145 },
  publisherMonogram: { color: colors.red, fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  publisherName: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 13 },
  publisherFocus: { color: colors.dim, fontSize: 9, lineHeight: 13, marginTop: 3 },
  loading: { alignItems: 'center', paddingVertical: 100 },
  loadingText: { color: colors.dim, fontSize: 11, marginTop: 14 },
  empty: { alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, marginTop: 20, padding: 35 },
  emptyTitle: { color: colors.white, fontSize: 15, fontWeight: '800', marginTop: 12 },
  emptyText: { color: colors.dim, fontSize: 11, marginTop: 5, textAlign: 'center' },
  bottomNav: { backgroundColor: '#0B0C0EFA', borderTopColor: colors.border, borderTopWidth: 1, bottom: 0, flexDirection: 'row', left: 0, paddingTop: 9, position: 'absolute', right: 0 },
  navItem: { alignItems: 'center', flex: 1, gap: 3, paddingVertical: 3, position: 'relative' },
  navLabel: { color: colors.dim, fontSize: 8, fontWeight: '700' },
  navLabelActive: { color: colors.white },
  navIndicator: { backgroundColor: colors.red, borderRadius: 2, height: 2, position: 'absolute', top: -10, width: 22 },
  profile: { alignItems: 'center', paddingTop: 35 },
  profileAvatar: { alignItems: 'center', backgroundColor: colors.red, borderRadius: 38, height: 76, justifyContent: 'center', width: 76 },
  profileAvatarText: { color: colors.white, fontSize: 20, fontWeight: '900' },
  profileTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 18 },
  profileSubtitle: { color: colors.gray, fontSize: 11, lineHeight: 17, marginTop: 7, maxWidth: 310, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 25, width: '100%' },
  stat: { alignItems: 'center', backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 15 },
  statNumber: { color: colors.white, fontSize: 18, fontWeight: '900' },
  statLabel: { color: colors.dim, fontSize: 9, marginTop: 3 },
  settingsCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 13, borderWidth: 1, marginTop: 18, overflow: 'hidden', width: '100%' },
  settingRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  settingText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  modal: { backgroundColor: colors.black, flex: 1 },
  modalHeader: { alignItems: 'center', backgroundColor: colors.black, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 9 },
  modalIconButton: { alignItems: 'center', backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 37, justifyContent: 'center', width: 37 },
  modalPublisher: { color: colors.white, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  modalActions: { flexDirection: 'row', gap: 7 },
  modalImage: { height: 275, width: '100%' },
  modalContent: { padding: 20 },
  modalCategory: { color: colors.red, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  modalTitle: { color: colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, lineHeight: 34, marginBottom: 14, marginTop: 8 },
  rule: { backgroundColor: colors.border, height: 1, marginVertical: 20 },
  summary: { color: colors.white, fontSize: 17, fontWeight: '700', lineHeight: 25 },
  bodyText: { color: colors.gray, fontSize: 13, lineHeight: 21, marginTop: 17 },
  readButton: { alignItems: 'center', backgroundColor: colors.red, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingHorizontal: 17, paddingVertical: 15 },
  readButtonText: { color: colors.white, fontSize: 12, fontWeight: '900' },
});
