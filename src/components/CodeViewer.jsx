import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createHighlighter } from 'shiki';
import { Copy, Check, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function extractDomainInfo(url) {
  try {
    const normalizedUrl = url && url.startsWith('http') ? url : 'https://' + (url || 'example.com');
    const hostname = new URL(normalizedUrl).hostname.replace('www.', '');
    const domain = hostname.split('.')[0];
    const className = domain.charAt(0).toUpperCase() + domain.slice(1);
    return { domain, className, fullUrl: normalizedUrl };
  } catch {
    return { domain: 'example', className: 'Example', fullUrl: 'https://example.com' };
  }
}

function generateSeleniumCode(domain, className, fullUrl) {
  return `import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


class ${className}LoginPage:
    """Page Object Model for ${className} Login Page."""

    URL = "${fullUrl}"

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    @property
    def username_field(self):
        return self.wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "[data-test='username'], #username, [name='username']")
        ))

    @property
    def password_field(self):
        return self.driver.find_element(
            By.CSS_SELECTOR, "[data-test='password'], #password, [name='password']"
        )

    @property
    def login_button(self):
        return self.driver.find_element(
            By.CSS_SELECTOR, "[data-test='login-button'], button[type='submit'], .login-btn"
        )

    @property
    def error_message(self):
        return self.driver.find_element(By.CSS_SELECTOR, ".error, [data-test='error']")

    def navigate(self):
        self.driver.get(self.URL)
        return self

    def login(self, username, password):
        self.username_field.clear()
        self.username_field.send_keys(username)
        self.password_field.clear()
        self.password_field.send_keys(password)
        self.login_button.click()
        return self


class ${className}DashboardPage:
    """Page Object Model for ${className} Dashboard Page."""

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    @property
    def dashboard_container(self):
        return self.driver.find_element(By.CSS_SELECTOR, ".dashboard, #dashboard, main")

    @property
    def navigation_items(self):
        return self.driver.find_elements(By.CSS_SELECTOR, "nav a, .nav-item")

    def is_displayed(self):
        return self.dashboard_container.is_displayed()


class Test${className}Login:
    """E2E tests for ${className} authentication flow."""

    @pytest.fixture(autouse=True)
    def setup(self):
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        self.login_page = ${className}LoginPage(self.driver)
        self.dashboard_page = ${className}DashboardPage(self.driver)
        yield
        self.driver.quit()

    def test_${domain}_valid_login_redirects_to_dashboard(self):
        self.login_page.navigate().login("testuser@${domain}.com", "SecurePass123!")

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".dashboard, main"))
        )

        assert self.dashboard_page.is_displayed()

    def test_${domain}_invalid_credentials_shows_error(self):
        self.login_page.navigate().login("invalid@${domain}.com", "wrongpassword")

        error = self.login_page.error_message
        assert error.is_displayed()

    def test_${domain}_navigation_elements_present(self):
        self.login_page.navigate().login("testuser@${domain}.com", "SecurePass123!")

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "nav, .navigation"))
        )

        nav_items = self.dashboard_page.navigation_items
        assert len(nav_items) > 0

    def test_${domain}_page_title_is_correct(self):
        self.login_page.navigate()
        assert "${className}" in self.driver.title or "${domain}" in self.driver.title.lower()`;
}

function generatePlaywrightCode(domain, className, fullUrl) {
  return `import pytest
from playwright.sync_api import Page, expect


class ${className}LoginPage:
    """Page Object Model for ${className} Login Page."""

    URL = "${fullUrl}"

    def __init__(self, page: Page):
        self.page = page
        self.username_field = page.locator("[data-test='username'], #username, [name='username']")
        self.password_field = page.locator("[data-test='password'], #password, [name='password']")
        self.login_button = page.locator("[data-test='login-button'], button[type='submit'], .login-btn")
        self.error_message = page.locator(".error, [data-test='error']")

    def navigate(self):
        self.page.goto(self.URL)
        return self

    def login(self, username: str, password: str):
        self.username_field.fill(username)
        self.password_field.fill(password)
        self.login_button.click()
        return self


class ${className}DashboardPage:
    """Page Object Model for ${className} Dashboard Page."""

    def __init__(self, page: Page):
        self.page = page
        self.dashboard_container = page.locator(".dashboard, #dashboard, main")
        self.navigation_items = page.locator("nav a, .nav-item")
        self.user_menu = page.locator(".user-menu, [data-test='user-menu']")


class Test${className}Login:
    """E2E tests for ${className} authentication flow."""

    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        self.page = page
        self.login_page = ${className}LoginPage(page)
        self.dashboard_page = ${className}DashboardPage(page)

    def test_${domain}_valid_login_redirects_to_dashboard(self):
        self.login_page.navigate().login("testuser@${domain}.com", "SecurePass123!")

        expect(self.dashboard_page.dashboard_container).to_be_visible()

    def test_${domain}_invalid_credentials_shows_error(self):
        self.login_page.navigate().login("invalid@${domain}.com", "wrongpassword")

        expect(self.login_page.error_message).to_be_visible()

    def test_${domain}_navigation_elements_present(self):
        self.login_page.navigate().login("testuser@${domain}.com", "SecurePass123!")

        expect(self.dashboard_page.navigation_items.first).to_be_visible()
        expect(self.dashboard_page.navigation_items).to_have_count_greater_than(0)

    def test_${domain}_page_title_is_correct(self):
        self.login_page.navigate()
        expect(self.page).to_have_title(/.*(${className}|${domain}).*/i)

    def test_${domain}_login_form_elements_visible(self):
        self.login_page.navigate()

        expect(self.login_page.username_field).to_be_visible()
        expect(self.login_page.password_field).to_be_visible()
        expect(self.login_page.login_button).to_be_visible()`;
}

export default function CodeViewer({ framework = 'playwright', url = '', isVisible, files }) {
  const { isDark } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const hasRealFiles = files && files.length > 0;

  const { domain, className, fullUrl } = useMemo(() => extractDomainInfo(url), [url]);

  const mockCode = useMemo(() => {
    return framework === 'selenium'
      ? generateSeleniumCode(domain, className, fullUrl)
      : generatePlaywrightCode(domain, className, fullUrl);
  }, [framework, domain, className, fullUrl]);

  const currentFile = hasRealFiles ? files[activeTab] : null;
  const code = hasRealFiles ? currentFile.content : mockCode;
  const filename = hasRealFiles ? currentFile.filename : 'test_generated.py';

  const shikiTheme = isDark ? 'github-dark' : 'github-light';

  useEffect(() => {
    setActiveTab(0);
  }, [files]);

  useEffect(() => {
    if (!isVisible) return;

    let mounted = true;
    setIsLoading(true);

    createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['python']
    }).then(highlighter => {
      if (!mounted) return;
      const html = highlighter.codeToHtml(code, {
        lang: 'python',
        theme: shikiTheme
      });
      setHighlightedCode(html);
      setIsLoading(false);
    });

    return () => { mounted = false; };
  }, [code, isVisible, shikiTheme]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename.split('/').pop();
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleDownloadAll = () => {
    if (!hasRealFiles) return;
    files.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.filename.split('/').pop();
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      }, index * 200);
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginTop: '24px',
        maxWidth: '860px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        style={{
          background: 'var(--code-bar-bg)',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasRealFiles && files.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '2px',
              paddingTop: '8px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '-1px',
            }}
          >
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: activeTab === index ? 'var(--text)' : 'var(--text-muted)',
                  background: activeTab === index ? 'var(--code-area-bg)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  borderBottom: activeTab === index ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {file.filename.split('/').pop()}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filename}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              onClick={handleCopy}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: copied ? '#10b981' : 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              whileHover={{ opacity: 0.8 }}
            >
              {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
            <motion.button
              onClick={hasRealFiles && files.length > 1 ? handleDownloadAll : handleDownload}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              whileHover={{ opacity: 0.8 }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              {hasRealFiles && files.length > 1 ? 'Download All' : 'Download'}
            </motion.button>
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--code-area-bg)',
          overflowX: 'auto',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
        className="code-viewer"
      >
        {isLoading ? (
          <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Loading syntax highlighting...
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        )}
      </div>
    </motion.div>
  );
}
