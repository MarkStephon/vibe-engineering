/**
 * Debug Checker - 验证 GitHub Actions 配置完整性
 * 用于在 debug mode 下检查工作流依赖关系
 */

const fs = require('fs');
const path = require('path');

// #region agent log
const LOG_PATH = '/Users/xiaozihao/Documents/01_Projects/Work_Code/work/Team_AI/vibe-engineering-playbook/.cursor/debug.log';
function log(location, message, data, hypothesisId) {
  const entry = JSON.stringify({
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'config-check',
    hypothesisId,
    location,
    message,
    data
  }) + '\n';
  try {
    fs.appendFileSync(LOG_PATH, entry);
  } catch (e) {
    console.error('Log write failed:', e);
  }
}
// #endregion

async function checkWorkflowDependencies() {
  console.log('🔍 检查工作流依赖关系...\n');
  
  const workflowsDir = path.join(__dirname, '../workflows');
  const scriptsDir = __dirname;
  const actionsDir = path.join(__dirname, '../actions');
  const configFile = path.join(__dirname, '../config/workflow-config.json');
  
  // #region agent log
  log('debug-checker.js:32', '开始检查', { workflowsDir, scriptsDir, actionsDir, configFile }, 'H1');
  // #endregion
  
  // H1: 检查 workflow-config.json 依赖
  console.log('📋 [H1] 检查 workflow-config.json 依赖:');
  const configExists = fs.existsSync(configFile);
  // #region agent log
  log('debug-checker.js:40', 'Config file check', { configExists, configFile }, 'H1');
  // #endregion
  
  const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml'));
  const configReferences = [];
  
  for (const file of workflowFiles) {
    const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
    if (content.includes('workflow-config.json')) {
      configReferences.push(file);
    }
  }
  
  // #region agent log
  log('debug-checker.js:53', 'Config references found', { 
    configExists, 
    totalWorkflows: workflowFiles.length,
    referencingWorkflows: configReferences 
  }, 'H1');
  // #endregion
  
  console.log(`  ✓ 配置文件存在: ${configExists ? '✅' : '❌'}`);
  console.log(`  ✓ 引用此文件的工作流: ${configReferences.length > 0 ? configReferences.join(', ') : '无'}`);
  
  // 检查 JS 脚本中的配置引用
  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js') && f !== 'debug-checker.js');
  const scriptConfigRefs = [];
  
  for (const file of scriptFiles) {
    const content = fs.readFileSync(path.join(scriptsDir, file), 'utf8');
    if (content.includes('workflow-config.json')) {
      scriptConfigRefs.push(file);
    }
  }
  
  // #region agent log
  log('debug-checker.js:76', 'Script config references', { scriptConfigRefs }, 'H1');
  // #endregion
  
  console.log(`  ✓ 引用配置的脚本: ${scriptConfigRefs.length > 0 ? scriptConfigRefs.join(', ') : '无'}\n`);
  
  // H2: 检查 Actions 引用
  console.log('📦 [H2] 检查 Actions 引用:');
  const deletedActions = ['openrouter-api', 'update-issue-status'];
  const actionReferences = {};
  
  for (const action of deletedActions) {
    actionReferences[action] = [];
    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
      if (content.includes(`uses: ./.github/actions/${action}`)) {
        actionReferences[action].push(file);
      }
    }
  }
  
  // #region agent log
  log('debug-checker.js:97', 'Action references check', { actionReferences }, 'H2');
  // #endregion
  
  for (const [action, refs] of Object.entries(actionReferences)) {
    console.log(`  ✓ ${action}: ${refs.length > 0 ? '❌ ' + refs.join(', ') : '✅ 无引用'}`);
  }
  console.log();
  
  // H3: 检查标签触发
  console.log('🏷️  [H3] 检查标签触发功能:');
  const routerFile = path.join(workflowsDir, 'vibe-router.yml');
  const routerContent = fs.readFileSync(routerFile, 'utf8');
  const hasLabeledTrigger = routerContent.includes('types:') && routerContent.includes('labeled');
  const hasOpenedTrigger = routerContent.includes('types:') && routerContent.includes('opened');
  
  // #region agent log
  log('debug-checker.js:113', 'Trigger conditions', { 
    hasLabeledTrigger, 
    hasOpenedTrigger,
    file: 'vibe-router.yml'
  }, 'H3');
  // #endregion
  
  console.log(`  ✓ vibe-router.yml 监听 'opened': ${hasOpenedTrigger ? '✅' : '❌'}`);
  console.log(`  ✓ vibe-router.yml 监听 'labeled': ${hasLabeledTrigger ? '✅' : '❌'}`);
  console.log(`  ⚠️  缺失标签触发: ${!hasLabeledTrigger ? '是（手动添加标签不会触发）' : '否'}\n`);
  
  // H4: 检查脚本路径引用
  console.log('📁 [H4] 检查脚本路径引用:');
  const scriptUsages = {};
  
  for (const file of workflowFiles) {
    const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
    for (const script of scriptFiles) {
      if (content.includes(script)) {
        if (!scriptUsages[script]) scriptUsages[script] = [];
        scriptUsages[script].push(file);
      }
    }
  }
  
  // #region agent log
  log('debug-checker.js:138', 'Script usage mapping', { scriptUsages }, 'H4');
  // #endregion
  
  for (const [script, workflows] of Object.entries(scriptUsages)) {
    console.log(`  ✓ ${script}: 被 ${workflows.join(', ')} 使用`);
  }
  
  // 检查路径格式
  for (const file of workflowFiles) {
    const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
    const requireMatches = content.match(/require\(['"]\.\.\/scripts\/[^'"]+['"]\)/g) || [];
    if (requireMatches.length > 0) {
      console.log(`  ✓ ${file}: 使用相对路径 ${requireMatches.join(', ')}`);
    }
  }
  console.log();
  
  // H5: 检查配置默认值
  console.log('⚙️  [H5] 检查配置默认值一致性:');
  const fallbackConfigs = {};
  
  for (const script of scriptFiles) {
    const content = fs.readFileSync(path.join(scriptsDir, script), 'utf8');
    
    // 提取 fallback 配置
    const fallbackMatch = content.match(/config\s*=\s*\{[\s\S]*?\};/);
    if (fallbackMatch) {
      fallbackConfigs[script] = fallbackMatch[0];
    }
  }
  
  // #region agent log
  log('debug-checker.js:170', 'Fallback configs extracted', { 
    scripts: Object.keys(fallbackConfigs),
    count: Object.keys(fallbackConfigs).length
  }, 'H5');
  // #endregion
  
  for (const [script, config] of Object.entries(fallbackConfigs)) {
    console.log(`  ✓ ${script}:`);
    console.log(`    ${config.substring(0, 100)}...`);
  }
  
  console.log('\n✅ 检查完成！');
  
  // 生成摘要报告
  const summary = {
    H1_config_missing: !configExists,
    H1_workflows_affected: configReferences,
    H2_action_references: actionReferences,
    H3_labeled_trigger_missing: !hasLabeledTrigger,
    H4_script_usages: scriptUsages,
    H5_fallback_count: Object.keys(fallbackConfigs).length
  };
  
  // #region agent log
  log('debug-checker.js:193', 'Final summary', summary, 'ALL');
  // #endregion
  
  return summary;
}

// 运行检查
checkWorkflowDependencies().catch(console.error);
